import { ClassDeclaration, GeneralizationSet, OntologicalNature as ASTNature } from "../generated/ast.js";
import { TontoNatures } from "../models/OntologicalCategory.js";
import { getGensetsWhereSpecific } from "../utils/genSetsWhereSpecific.js";
import { getOwningModel, getPrimaryContextModule } from "../utils/modelStatements.js";
import { tontoNatureUtils } from "../utils/tontoNatureUtils.js";

type NatureProviderSource = "stereotype" | "ontological-natures";

export interface NatureResolutionTrace {
    declaredNatures?: ASTNature[];
    nature: TontoNatures;
    path: string[];
    providerName: string;
    providerSource: NatureProviderSource;
    providerStereotype: string;
}

export interface ClassHoverInfo {
    derivationExplanation: string;
    nature: TontoNatures;
    primaryTrace?: NatureResolutionTrace;
    stereotype: string;
    stereotypeExplanation: string;
    traces: NatureResolutionTrace[];
}

interface DirectNatureProvider {
    declaredNatures?: ASTNature[];
    nature: TontoNatures;
    providerSource: NatureProviderSource;
}

const stereotypeExplanations: Record<string, string> = {
    category: "Rigid non-sortal that captures essential properties shared by instances of different kinds.",
    class: "Unspecified classifier. Its ontological commitment is still open.",
    collective: "Ultimate sortal for collectives whose members play the same role in the whole.",
    event: "Perdurant that happens in time and accumulates temporal parts.",
    extrinsicMode: "Ultimate sortal for externally dependent moments.",
    historicalRole: "Anti-rigid sortal grounded in event participation. It inherits identity and nature from a unique ultimate sortal.",
    historicalRoleMixin: "Anti-rigid non-sortal grounded in past events across different kinds.",
    intrinsicMode: "Ultimate sortal for intrinsic moments.",
    kind: "Ultimate sortal that provides an identity principle for functional complexes.",
    mixin: "Semi-rigid non-sortal that is essential to some instances and accidental to others.",
    mode: "Ultimate sortal for intrinsic moments that are not values in a conceptual space.",
    phase: "Anti-rigid sortal based on intrinsic contingent conditions. It inherits identity and nature from a unique ultimate sortal.",
    phaseMixin: "Anti-rigid non-sortal grounded in intrinsic contingent conditions across different kinds.",
    powertype: "Higher-order type that classifies the specializations of a base type.",
    process: "Ongoing perdurant that unfolds in time.",
    quality: "Ultimate sortal for measurable individualized qualities.",
    quantity: "Ultimate sortal for portions of matter.",
    relator: "Ultimate sortal for relators, the truth-makers of material relations.",
    role: "Anti-rigid sortal based on relational contingent conditions. It inherits identity and nature from a unique ultimate sortal.",
    roleMixin: "Anti-rigid non-sortal grounded in relational contingent conditions across different kinds.",
    situation: "State of affairs tied to a specific point in time.",
    subkind: "Rigid sortal that inherits identity and nature from a unique ultimate sortal.",
    type: "Higher-order type whose instances are themselves types.",
};

function getGeneralizationSets(node: ClassDeclaration): GeneralizationSet[] {
    const model = getOwningModel(node);
    const contextModule = model ? getPrimaryContextModule(model) : undefined;
    if (!contextModule) {
        return [];
    }
    return contextModule.declarations.filter(
        (declaration): declaration is GeneralizationSet => declaration.$type === "GeneralizationSet"
    );
}

function normalizeDeclaredNature(nature: ASTNature): TontoNatures {
    if (nature === "intrinsic-modes" || nature === "extrinsic-modes") {
        return "modes";
    }
    return nature;
}

function getDirectNatureProvider(node: ClassDeclaration): DirectNatureProvider | undefined {
    const stereotype = node.classElementType.ontologicalCategory;
    switch (stereotype) {
        case "kind":
            return { nature: "functional-complexes", providerSource: "stereotype" };
        case "collective":
            return { nature: "collectives", providerSource: "stereotype" };
        case "quantity":
            return { nature: "quantities", providerSource: "stereotype" };
        case "relator":
            return { nature: "relators", providerSource: "stereotype" };
        case "quality":
            return { nature: "qualities", providerSource: "stereotype" };
        case "mode":
        case "intrinsicMode":
        case "extrinsicMode":
            return { nature: "modes", providerSource: "stereotype" };
        case "type":
        case "powertype":
            return { nature: "types", providerSource: "stereotype" };
        case "event":
        case "process":
            return { nature: "events", providerSource: "stereotype" };
        case "situation":
            return { nature: "situations", providerSource: "stereotype" };
        case "category":
        case "mixin":
        case "phaseMixin":
        case "roleMixin":
        case "historicalRoleMixin": {
            const declaredNatures = node.ontologicalNatures?.natures;
            if (!declaredNatures || declaredNatures.length === 0) {
                return undefined;
            }
            return {
                declaredNatures,
                nature: normalizeDeclaredNature(declaredNatures[0]),
                providerSource: "ontological-natures",
            };
        }
        default:
            return undefined;
    }
}

function dedupeTraces(traces: NatureResolutionTrace[]): NatureResolutionTrace[] {
    const seen = new Set<string>();
    return traces.filter((trace) => {
        const key = `${trace.providerSource}:${trace.providerStereotype}:${trace.providerName}:${trace.nature}:${trace.path.join("->")}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

function resolveNatureTraces(
    node: ClassDeclaration,
    genSets: GeneralizationSet[],
    visited: Set<string> = new Set()
): NatureResolutionTrace[] {
    const nodeKey = `${node.$type}:${node.name}`;
    if (visited.has(nodeKey)) {
        return [];
    }

    const nextVisited = new Set(visited);
    nextVisited.add(nodeKey);

    const directProvider = getDirectNatureProvider(node);
    if (directProvider) {
        return [{
            declaredNatures: directProvider.declaredNatures,
            nature: directProvider.nature,
            path: [node.name],
            providerName: node.name,
            providerSource: directProvider.providerSource,
            providerStereotype: node.classElementType.ontologicalCategory,
        }];
    }

    const traces: NatureResolutionTrace[] = [];
    node.specializationEndurants.forEach((specialization) => {
        const parent = specialization.ref;
        if (!parent || parent.name === node.name) {
            return;
        }

        resolveNatureTraces(parent, genSets, nextVisited).forEach((trace) => {
            traces.push({
                ...trace,
                path: [node.name, ...trace.path],
            });
        });
    });

    getGensetsWhereSpecific(node.name, genSets).forEach((genSet) => {
        const parent = genSet.generalItem.ref;
        if (!parent || parent.$type !== "ClassDeclaration" || parent.name === node.name) {
            return;
        }

        resolveNatureTraces(parent, genSets, nextVisited).forEach((trace) => {
            traces.push({
                ...trace,
                path: [node.name, ...trace.path],
            });
        });
    });

    return dedupeTraces(traces);
}

function formatNatureClause(natures: ASTNature[]): string {
    return `of ${natures.join(", ")}`;
}

function formatProviderLabel(trace: NatureResolutionTrace): string {
    return `\`${trace.providerStereotype} ${trace.providerName}\``;
}

function buildDerivationExplanation(node: ClassDeclaration, trace?: NatureResolutionTrace): string {
    if (!trace) {
        return `The nature of \`${node.name}\` could not be resolved from its stereotype, declared natures, or specialization chain.`;
    }

    const resolvedNature = `\`${trace.nature}\``;
    if (trace.path.length === 1) {
        if (trace.providerSource === "ontological-natures" && trace.declaredNatures?.length) {
            return `\`${node.name}\` declares its own nature directly through \`${formatNatureClause(trace.declaredNatures)}\`, which resolves to ${resolvedNature}.`;
        }
        return `\`${node.name}\` provides its own nature directly: ${formatProviderLabel(trace)} implies ${resolvedNature}.`;
    }

    const pathLabel = `\`${trace.path.join(" -> ")}\``;
    if (trace.providerSource === "ontological-natures" && trace.declaredNatures?.length) {
        return `\`${node.name}\` does not provide its own nature. Following the specialization chain ${pathLabel} reaches ${formatProviderLabel(trace)}, which declares \`${formatNatureClause(trace.declaredNatures)}\` and resolves to ${resolvedNature}.`;
    }

    return `\`${node.name}\` does not provide its own nature. Following the specialization chain ${pathLabel} reaches ${formatProviderLabel(trace)}, which provides the ${resolvedNature} nature.`;
}

export function getClassHoverInfo(node: ClassDeclaration): ClassHoverInfo {
    const traces = resolveNatureTraces(node, getGeneralizationSets(node));
    const primaryTrace = traces[0];
    const resolvedNature = primaryTrace?.nature ?? tontoNatureUtils.getTontoNature(node).nature;
    const stereotype = node.classElementType.ontologicalCategory;

    return {
        derivationExplanation: buildDerivationExplanation(node, primaryTrace),
        nature: resolvedNature,
        primaryTrace,
        stereotype,
        stereotypeExplanation: stereotypeExplanations[stereotype] ?? "No hover explanation is available for this stereotype yet.",
        traces,
    };
}

export function buildClassDeclarationHoverMarkdown(node: ClassDeclaration): string {
    const hoverInfo = getClassHoverInfo(node);
    const lines = [
        `**${hoverInfo.stereotype} \`${node.name}\`**`,
        "",
        hoverInfo.stereotypeExplanation,
        "",
        `- Ontological Category: \`${hoverInfo.stereotype}\``,
        `- Name: \`${node.name}\``,
        `- Ontological Nature: \`${hoverInfo.nature}\``,
    ];

    if (hoverInfo.primaryTrace?.path.length && hoverInfo.primaryTrace.path.length > 1) {
        lines.push(`- Trace: \`${hoverInfo.primaryTrace.path.join(" -> ")}\``);
    }

    if (hoverInfo.primaryTrace?.providerSource === "ontological-natures" && hoverInfo.primaryTrace.declaredNatures?.length) {
        lines.push(`- Declared Restriction: \`${formatNatureClause(hoverInfo.primaryTrace.declaredNatures)}\``);
    }

    lines.push("", hoverInfo.derivationExplanation);

    if (hoverInfo.traces.length > 1) {
        lines.push("", "Additional resolution paths:");
        hoverInfo.traces.slice(1).forEach((trace) => {
            lines.push(`- \`${trace.path.join(" -> ")}\` -> \`${trace.nature}\``);
        });
    }

    return lines.join("\n");
}
