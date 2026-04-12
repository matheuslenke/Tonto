import ElkConstructor from "elkjs";
import { NodeFileSystem } from "langium/node";
import { access } from "node:fs/promises";
import path from "node:path";
import { createTontoServices } from "../language/tonto-module.js";
import {
    Attribute,
    ClassDeclaration,
    ContextModule,
    DataType,
    ElementRelation,
    Model,
    isClassDeclaration,
    isDataType,
    isElementRelation
} from "../language/generated/ast.js";
import { getModelContextModules, getPrimaryContextModuleOrThrow } from "../language/utils/modelStatements.js";
import { isAntiRigidStereotype, isRigidStereotype, isSemiRigidStereotype } from "../language/models/StereotypeUtils.js";
import { isNonSortalOntoCategory } from "../language/models/OntologicalCategory.js";
import { TontoNatureResult, tontoNatureUtils } from "../language/utils/tontoNatureUtils.js";
import { buildFolderDocuments } from "../cli/utils/buildFolderDocuments.js";
import {
    TontoDiagramAttribute,
    TontoDiagramConnector,
    TontoDiagramEdge,
    TontoDiagramGraph,
    TontoDiagramIssue,
    TontoDiagramNode,
    TontoDiagramPaletteToken,
    TontoDiagramRigidity,
    TontoDiagramSpec
} from "./types.js";

const ELK_CLASS = "default" in ElkConstructor ? ElkConstructor.default : ElkConstructor;
const ELK = new ELK_CLASS({ algorithms: ["layered"] });

const DEFAULT_NODE_WIDTH = 260;
const HEADER_HEIGHT = 58;
const ROW_HEIGHT = 24;
const NODE_PADDING = 24;

type LayoutNode = {
    id: string;
    width: number;
    height: number;
};

type LayoutEdge = {
    id: string;
    sources: string[];
    targets: string[];
};

export async function buildTontoDiagramGraph(
    spec: TontoDiagramSpec,
    diagramPath: string
): Promise<TontoDiagramGraph> {
    const sourcePath = resolveDiagramSourcePath(spec.source, diagramPath);
    const projectRoot = await findTontoProjectRoot(path.dirname(sourcePath));
    const services = createTontoServices({ ...NodeFileSystem }).Tonto;
    const builtDocuments = await buildFolderDocuments(projectRoot, services, { validation: false });
    const sourceModel = findModelForPath(builtDocuments.models, sourcePath);

    if (!sourceModel) {
        throw new Error(`Could not resolve Tonto source file at ${sourcePath}.`);
    }

    const contextModule = resolveTargetModule(sourceModel, builtDocuments.models, spec.module);
    if (!contextModule) {
        throw new Error(`Could not resolve Tonto module \`${spec.module}\`.`);
    }

    const graphIssues: TontoDiagramIssue[] = [];
    const nodes = collectNodes(contextModule, spec.filter.datatypes);
    const edgeCollection = collectEdges(contextModule, spec.filter.external);
    const nodesById = new Map(nodes.map((node) => [node.id, node]));
    for (const externalNode of edgeCollection.externalNodes) {
        if (!nodesById.has(externalNode.id)) {
            nodesById.set(externalNode.id, externalNode);
        }
    }
    const edges = edgeCollection.edges;
    nodes.splice(0, nodes.length, ...nodesById.values());

    if (spec.filter.include.length > 0) {
        applyIncludeFilter(nodes, edges, spec.filter.include, graphIssues);
    }

    const layoutTargets = await computeFallbackLayout(
        nodes.map((node) => ({
            id: node.id,
            width: node.size.width,
            height: node.size.height,
        })),
        edges.map((edge) => ({
            id: edge.id,
            sources: [edge.source],
            targets: [edge.target],
        })),
        spec.presentation.direction
    );

    const savedLayouts = resolveSavedLayouts(spec, nodes);

    for (const node of nodes) {
        const savedLayout = savedLayouts.get(node.id);
        const fallbackLayout = layoutTargets.get(node.id);
        const position = savedLayout ?? fallbackLayout ?? { x: node.position.x, y: node.position.y };
        node.position = position;
    }

    return {
        title: spec.title,
        source: sourcePath,
        module: contextModule.name,
        viewport: spec.viewport,
        nodes: nodes.sort((left, right) => left.id.localeCompare(right.id)),
        edges: edges.sort((left, right) => left.id.localeCompare(right.id)),
        issues: graphIssues,
    };
}

export function resolveDiagramSourcePath(source: string, diagramPath: string): string {
    return path.resolve(path.dirname(diagramPath), source);
}

function findModelForPath(models: Model[], filePath: string): Model | undefined {
    const normalizedPath = path.resolve(filePath);

    return models.find((model) => model.$document?.uri.fsPath === normalizedPath);
}

function resolveTargetModule(sourceModel: Model, models: Model[], requestedModule: string | undefined): ContextModule | undefined {
    if (!requestedModule) {
        return getPrimaryContextModuleOrThrow(sourceModel);
    }

    for (const model of models) {
        const contextModule = getModelContextModules(model).find((candidate) => candidate.name === requestedModule);
        if (contextModule) {
            return contextModule;
        }
    }

    return undefined;
}

function collectNodes(contextModule: ContextModule, includeDatatypes: boolean): TontoDiagramNode[] {
    const nodes: TontoDiagramNode[] = [];

    for (const declaration of contextModule.declarations) {
        if (isClassDeclaration(declaration)) {
            nodes.push(createClassNode(declaration, false));
        }
        if (includeDatatypes && isDataType(declaration)) {
            nodes.push(createDatatypeNode(declaration, false));
        }
    }

    return nodes;
}

function collectEdges(
    contextModule: ContextModule,
    includeExternal: boolean
): { edges: TontoDiagramEdge[]; externalNodes: TontoDiagramNode[] } {
    const edges: TontoDiagramEdge[] = [];
    const externalNodes = new Map<string, TontoDiagramNode>();

    for (const declaration of contextModule.declarations) {
        if (isClassDeclaration(declaration)) {
            for (const relation of declaration.references) {
                const edge = createRelationEdge(contextModule, relation, includeExternal);
                if (edge) {
                    edges.push(edge.edge);
                    for (const externalNode of edge.externalNodes) {
                        externalNodes.set(externalNode.id, externalNode);
                    }
                }
            }

            for (const specialization of declaration.specializationEndurants) {
                const target = specialization.ref;
                if (!target) {
                    continue;
                }
                const isExternal = target.$container.name !== contextModule.name;
                if (isExternal && !includeExternal) {
                    continue;
                }

                if (isExternal) {
                    externalNodes.set(getNodeId(target.$container.name, target.name), createClassNode(target, true));
                }

                edges.push({
                    id: `${getNodeId(declaration.$container.name, declaration.name)}::specializes::${getNodeId(target.$container.name, target.name)}`,
                    kind: "specialization",
                    source: getNodeId(declaration.$container.name, declaration.name),
                    target: getNodeId(target.$container.name, target.name),
                });
            }
        }

        if (isElementRelation(declaration)) {
            const edge = createRelationEdge(contextModule, declaration, includeExternal);
            if (edge) {
                edges.push(edge.edge);
                for (const externalNode of edge.externalNodes) {
                    externalNodes.set(externalNode.id, externalNode);
                }
            }
        }
    }

    return {
        edges: dedupeEdges(edges),
        externalNodes: [...externalNodes.values()].filter((node) => node.appearance.external),
    };
}

function createRelationEdge(
    contextModule: ContextModule,
    relation: ElementRelation,
    includeExternal: boolean
): { edge: TontoDiagramEdge; externalNodes: TontoDiagramNode[] } | undefined {
    const sourceElement = relation.firstEnd?.ref ?? (isClassDeclaration(relation.$container) ? relation.$container : undefined);
    const targetElement = relation.secondEnd.ref;

    if (!sourceElement || !targetElement) {
        return undefined;
    }

    if ((!isClassDeclaration(sourceElement) && !isDataType(sourceElement)) || (!isClassDeclaration(targetElement) && !isDataType(targetElement))) {
        return undefined;
    }

    const sourceModule = sourceElement.$container;
    const targetModule = targetElement.$container;
    const isExternal = sourceModule.name !== contextModule.name || targetModule.name !== contextModule.name;
    if (isExternal && !includeExternal) {
        return undefined;
    }

    const edgeId = `${getNodeId(sourceModule.name, sourceElement.name)}::${relation.name ?? relation.relationType ?? "unnamed"}::${getNodeId(targetModule.name, targetElement.name)}`;
    const edge: TontoDiagramEdge = {
        id: edgeId,
        kind: "relation",
        source: getNodeId(sourceModule.name, sourceElement.name),
        target: getNodeId(targetModule.name, targetElement.name),
        label: relation.name,
        stereotype: relation.relationType,
        connector: getConnector(relation),
        sourceCardinality: formatCardinality(relation.firstCardinality),
        targetCardinality: formatCardinality(relation.secondCardinality),
    };

    const externalNodes: TontoDiagramNode[] = [];

    if (sourceModule.name !== contextModule.name) {
        externalNodes.push(
            isClassDeclaration(sourceElement)
                ? createClassNode(sourceElement, true)
                : createDatatypeNode(sourceElement, true)
        );
    }

    if (targetModule.name !== contextModule.name) {
        externalNodes.push(
            isClassDeclaration(targetElement)
                ? createClassNode(targetElement, true)
                : createDatatypeNode(targetElement, true)
        );
    }

    return { edge, externalNodes };
}

function createClassNode(classDeclaration: ClassDeclaration, external: boolean): TontoDiagramNode {
    const stereotype = classDeclaration.classElementType.ontologicalCategory;
    const nature = tontoNatureUtils.getTontoNature(classDeclaration);
    const attributes = classDeclaration.attributes.map(formatAttribute);
    const size = computeNodeSize(classDeclaration.name, attributes);

    return {
        id: getNodeId(classDeclaration.$container.name, classDeclaration.name),
        specifier: getNodeSpecifier(classDeclaration.$container.name, classDeclaration.name, external),
        label: classDeclaration.name,
        module: classDeclaration.$container.name,
        stereotype,
        kind: "class",
        appearance: {
            palette: normalizePaletteToken(nature),
            rigidity: getRigidity(stereotype),
            accent: isNonSortalOntoCategory(stereotype) ? "non-sortal" : "sortal",
            external,
        },
        attributes,
        isEnum: false,
        position: { x: 0, y: 0 },
        size,
    };
}

function createDatatypeNode(datatype: DataType, external: boolean): TontoDiagramNode {
    const attributes = datatype.isEnum
        ? datatype.elements.map((element) => ({
            name: element.name,
            type: "enum",
        }))
        : datatype.attributes.map(formatAttribute);
    const size = computeNodeSize(datatype.name, attributes);

    return {
        id: getNodeId(datatype.$container.name, datatype.name),
        specifier: getNodeSpecifier(datatype.$container.name, datatype.name, external),
        label: datatype.name,
        module: datatype.$container.name,
        stereotype: datatype.isEnum ? "enum" : "datatype",
        kind: "datatype",
        appearance: {
            palette: "none",
            rigidity: "unknown",
            accent: "neutral",
            external,
        },
        attributes,
        isEnum: datatype.isEnum,
        position: { x: 0, y: 0 },
        size,
    };
}

function formatAttribute(attribute: Attribute): TontoDiagramAttribute {
    return {
        name: attribute.name,
        type: attribute.attributeTypeRef.ref?.name ?? attribute.attributeTypeRef.$refText ?? "Unknown",
        cardinality: formatCardinality(attribute.cardinality),
    };
}

function computeNodeSize(label: string, attributes: TontoDiagramAttribute[]): TontoDiagramNode["size"] {
    const widestAttribute = attributes.reduce((current, attribute) => {
        const attributeLabel = attribute.cardinality
            ? `${attribute.name}: ${attribute.type} ${attribute.cardinality}`
            : `${attribute.name}: ${attribute.type}`;
        return Math.max(current, attributeLabel.length);
    }, label.length);

    const width = Math.max(DEFAULT_NODE_WIDTH, widestAttribute * 8 + NODE_PADDING * 2);
    const height = HEADER_HEIGHT + Math.max(attributes.length, 1) * ROW_HEIGHT + NODE_PADDING;

    return {
        width,
        height,
    };
}

function normalizePaletteToken(nature: TontoNatureResult): TontoDiagramPaletteToken {
    if (nature.nature === "objects") {
        return "functional-complexes";
    }
    return nature.nature;
}

function getRigidity(stereotype: string): TontoDiagramRigidity {
    if (isRigidStereotype(stereotype)) {
        return "rigid";
    }
    if (isAntiRigidStereotype(stereotype)) {
        return "anti-rigid";
    }
    if (isSemiRigidStereotype(stereotype)) {
        return "semi-rigid";
    }
    return "unknown";
}

function getConnector(relation: ElementRelation): TontoDiagramConnector {
    if (relation.isComposition) {
        return "composition";
    }
    if (relation.isCompositionInverted) {
        return "composition-inverted";
    }
    if (relation.isAggregation) {
        return "aggregation";
    }
    if (relation.isAggregationInverted) {
        return "aggregation-inverted";
    }
    return "association";
}

function formatCardinality(cardinality: Attribute["cardinality"] | ElementRelation["firstCardinality"]): string | undefined {
    if (!cardinality) {
        return undefined;
    }

    if (cardinality.upperBound === undefined) {
        return `[${cardinality.lowerBound}]`;
    }

    return `[${cardinality.lowerBound}..${cardinality.upperBound}]`;
}

function getNodeId(moduleName: string, elementName: string): string {
    return `${moduleName}.${elementName}`;
}

function getNodeSpecifier(moduleName: string, elementName: string, external: boolean): string {
    if (external) {
        return `${moduleName}.${elementName}`;
    }
    return elementName;
}

function dedupeEdges(edges: TontoDiagramEdge[]): TontoDiagramEdge[] {
    const seen = new Map<string, TontoDiagramEdge>();

    for (const edge of edges) {
        seen.set(edge.id, edge);
    }

    return [...seen.values()];
}

function applyIncludeFilter(
    nodes: TontoDiagramNode[],
    edges: TontoDiagramEdge[],
    include: string[],
    issues: TontoDiagramIssue[]
): void {
    const includeSet = new Set(include);
    const includedNodeIds = new Set<string>();
    const includedEdgeIds = new Set<string>();
    const nodeLookup = new Map(nodes.map((node) => [node.id, node]));

    for (const node of nodes) {
        if (includeSet.has(node.label) || includeSet.has(node.id) || includeSet.has(node.specifier)) {
            includedNodeIds.add(node.id);
        }
    }

    for (const edge of edges) {
        if (includeSet.has(edge.label ?? "") || includeSet.has(edge.id)) {
            includedEdgeIds.add(edge.id);
            includedNodeIds.add(edge.source);
            includedNodeIds.add(edge.target);
        }
    }

    if (includedNodeIds.size === 0 && includedEdgeIds.size === 0) {
        issues.push({
            severity: "warning",
            message: "Include filter did not match any diagram elements.",
        });
        return;
    }

    for (const edge of edges) {
        if (includedNodeIds.has(edge.source) && includedNodeIds.has(edge.target)) {
            includedEdgeIds.add(edge.id);
        }
    }

    const filteredNodes = nodes.filter((node) => includedNodeIds.has(node.id));
    const filteredEdges = edges.filter((edge) => includedEdgeIds.has(edge.id));

    nodes.splice(0, nodes.length, ...filteredNodes);
    edges.splice(0, edges.length, ...filteredEdges);

    for (const includeItem of includeSet) {
        const matched = filteredNodes.some((node) => node.id === includeItem || node.label === includeItem || node.specifier === includeItem)
            || filteredEdges.some((edge) => edge.id === includeItem || edge.label === includeItem);
        if (!matched) {
            issues.push({
                severity: "warning",
                message: `Include entry \`${includeItem}\` did not resolve to a visible element.`,
            });
        }
    }

    for (const node of filteredNodes) {
        if (!nodeLookup.has(node.id)) {
            issues.push({
                severity: "warning",
                message: `Node \`${node.id}\` resolved unexpectedly.`,
            });
        }
    }
}

function resolveSavedLayouts(spec: TontoDiagramSpec, nodes: TontoDiagramNode[]): Map<string, { x: number; y: number }> {
    const layouts = new Map<string, { x: number; y: number }>();
    const lookup = new Map<string, string>();

    for (const node of nodes) {
        lookup.set(node.id, node.id);
        lookup.set(node.label, node.id);
        lookup.set(node.specifier, node.id);
    }

    for (const layout of spec.nodes) {
        const resolvedId = lookup.get(layout.target);
        if (!resolvedId) {
            continue;
        }
        layouts.set(resolvedId, { x: layout.x, y: layout.y });
    }

    return layouts;
}

async function computeFallbackLayout(
    nodes: LayoutNode[],
    edges: LayoutEdge[],
    direction: TontoDiagramSpec["presentation"]["direction"]
): Promise<Map<string, { x: number; y: number }>> {
    if (nodes.length === 0) {
        return new Map();
    }

    const elkGraph = await ELK.layout({
        id: "root",
        layoutOptions: {
            "elk.algorithm": "layered",
            "elk.direction": direction,
            "elk.spacing.nodeNode": "60",
            "elk.layered.spacing.nodeNodeBetweenLayers": "90",
        },
        children: nodes,
        edges,
    });

    const positions = new Map<string, { x: number; y: number }>();

    for (const node of elkGraph.children ?? []) {
        positions.set(node.id, {
            x: node.x ?? 0,
            y: node.y ?? 0,
        });
    }

    return positions;
}

async function findTontoProjectRoot(startDirectory: string): Promise<string> {
    let currentDirectory = path.resolve(startDirectory);

    while (true) {
        const manifestPath = path.join(currentDirectory, "tonto.json");
        try {
            await access(manifestPath);
            return currentDirectory;
        } catch {
            const parentDirectory = path.dirname(currentDirectory);
            if (parentDirectory === currentDirectory) {
                return startDirectory;
            }
            currentDirectory = parentDirectory;
        }
    }
}
