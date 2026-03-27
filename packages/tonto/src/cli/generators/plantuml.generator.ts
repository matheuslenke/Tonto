import {
    ClassDeclaration,
    ContextModule,
    DataType,
    ElementRelation,
    isClassDeclaration,
    isContextModule,
    isDataType,
    isElementRelation,
    isModel,
    Model
} from "../../language/generated/ast.js";
import { getModelContextModules } from "../../language/utils/modelStatements.js";
import { tontoNatureUtils } from "../../language/utils/tontoNatureUtils.js";

const COLORS = {
    GREEN: "#99FF99",
    LIGHT_GREEN: "#D3FFD3",
    PINK: "#FF99A3",
    LIGHT_PINK: "#FFDADD",
    BLUE: "#70D7FF",
    LIGHT_BLUE: "#C0EDFF",
    WHITE: "#FFFFFF",
    YELLOW: "#FCFCD4",
    ORANGE: "#FCE0C0",
    PURPLE: "#D3D3FC",
    GREY: "#E0E0E0"
};

const mainColorMap: Record<string, string> = {
    "functional-complexes": COLORS.PINK,
    "collectives": COLORS.PINK,
    "quantities": COLORS.PINK,
    "relators": COLORS.GREEN,
    "qualities": COLORS.BLUE,
    "modes": COLORS.BLUE,
    "events": COLORS.YELLOW,
    "situations": COLORS.ORANGE,
    "types": COLORS.PURPLE,
    "abstract-individuals": COLORS.WHITE,
    "none": COLORS.GREY
};

const alternativeColorMap: Record<string, string> = {
    "functional-complexes": COLORS.LIGHT_PINK,
    "collectives": COLORS.LIGHT_PINK,
    "quantities": COLORS.LIGHT_PINK,
    "relators": COLORS.LIGHT_GREEN,
    "qualities": COLORS.LIGHT_BLUE,
    "modes": COLORS.LIGHT_BLUE,
    "events": COLORS.YELLOW,
    "situations": COLORS.ORANGE,
    "types": COLORS.PURPLE,
    "abstract-individuals": COLORS.WHITE,
    "none": COLORS.GREY
};

function getColor(element: ClassDeclaration): string | undefined {
    const natureResult = tontoNatureUtils.getTontoNature(element);
    
    if (natureResult.nature === "none") {
        return COLORS.GREY;
    }

    if (natureResult.isKind) {
        return mainColorMap[natureResult.nature];
    } else {
        return alternativeColorMap[natureResult.nature];
    }
}

export interface PlantUMLOptions {
    showExternalReferences: boolean;
    orthogonal?: boolean;
}

export function generatePlantUML(model: Model | ContextModule, options: PlantUMLOptions = { showExternalReferences: true, orthogonal: false }): string {
    let puml = "@startuml\n";
    puml += "skinparam classAttributeIconSize 0\n";
    puml += "hide empty members\n";
    puml += "skinparam nodesep 50\n";
    puml += "skinparam ranksep 50\n";
    puml += "skinparam backgroundColor white\n";
    if (options.orthogonal) {
        puml += "skinparam linetype ortho\n";
    }
    puml += "hide circle\n";

    const externalElements = new Set<ClassDeclaration>();

    function traverse(element: Model | ContextModule) {
        if (isModel(element)) {
            for (const contextModule of getModelContextModules(element)) {
                traverse(contextModule);
            }
        } else if (isContextModule(element)) {
            if (element.declarations) {
                // Sort declarations to improve layout: Roots first
                const classes = element.declarations.filter(isClassDeclaration);
                const others = element.declarations.filter(d => !isClassDeclaration(d));

                const sortedClasses = sortClasses(classes);

                for (const decl of sortedClasses) {
                    puml += generateClass(decl);
                    // Generate generalizations
                    if (decl.specializationEndurants) {
                        for (const parentRef of decl.specializationEndurants) {
                            if (parentRef.ref) {
                                // Check if parent is in the same module or if we show external refs
                                if (options.showExternalReferences || parentRef.ref.$container === element) {
                                    const isExternal = parentRef.ref.$container !== element;
                                    if (isExternal && isClassDeclaration(parentRef.ref)) {
                                        externalElements.add(parentRef.ref);
                                    }
                                    const arrow = isExternal ? "<|----" : "<|--";
                                    puml += `"${parentRef.ref.name}" ${arrow} "${decl.name}"\n`;
                                }
                            } else if (parentRef.$refText) {
                                // If we don't have the ref, we assume it might be external or unresolved.
                                // If we want to be strict about "external", we might skip this if !showExternalReferences
                                // But usually $refText means it's not resolved in the AST, so it's likely external/missing.
                                if (options.showExternalReferences) {
                                    // Unresolved refs are treated as external
                                    puml += `"${parentRef.$refText}" <|---- "${decl.name}"\n`;
                                }
                            }
                        }
                    }
                    // Generate inline relations
                    if (decl.references) {
                        const directions = ["d", "r", "l", "u"];
                        decl.references.forEach((ref, index) => {
                            const direction = decl.references.length > 1 ? directions[index % directions.length] : undefined;
                            puml += generateRelation(ref, element, options, direction, externalElements);
                        });
                    }
                }

                for (const decl of others) {
                    if (isElementRelation(decl)) {
                        puml += generateRelation(decl, element, options, undefined, externalElements);
                    } else if (isDataType(decl)) {
                        puml += generateDataType(decl);
                    }
                }
            }
        }
    }

    traverse(model);

    // Generate external elements
    if (externalElements.size > 0) {
        puml += "\n' External Elements\n";
        for (const element of externalElements) {
            puml += generateClass(element);
        }
    }

    puml += "@enduml";
    return puml;
}

function sortClasses(classes: ClassDeclaration[]): ClassDeclaration[] {
    // Simple heuristic: Classes with no specializations (roots) first
    // This helps PlantUML/Graphviz with the hierarchy layout
    const roots = classes.filter(c => c.specializationEndurants.length === 0);
    const children = classes.filter(c => c.specializationEndurants.length > 0);
    return [...roots, ...children];
}

function generateClass(element: ClassDeclaration): string {
    let classDef = `class "${element.name}"`;
    const stereotype = element.classElementType?.ontologicalCategory;
    if (stereotype) {
        classDef += ` <<${stereotype}>>`;
    }

    // Add color
    // Add color
    const color = getColor(element);
    if (color) {
        classDef += ` ${color}`;
    }

    classDef += " {\n";

    if (element.attributes) {
        for (const attr of element.attributes) {
            // Fix: Use $refText if ref is not resolved
            const typeName = attr.attributeTypeRef?.ref?.name || attr.attributeTypeRef?.$refText || "Unknown";
            classDef += `  ${attr.name} : ${typeName}\n`;
        }
    }

    classDef += "}\n";
    return classDef;
}

function generateDataType(element: DataType): string {
    if (element.isEnum) {
        let enumDef = `enum "${element.name}" <<enum>> {\n`;
        if (element.elements) {
            for (const item of element.elements) {
                enumDef += `  ${item.name}\n`;
            }
        }
        enumDef += "}\n";
        return enumDef;
    }

    let classDef = `class "${element.name}" <<DataType>>`;
    classDef += " {\n";

    if (element.attributes) {
        for (const attr of element.attributes) {
            const typeName = attr.attributeTypeRef?.ref?.name || attr.attributeTypeRef?.$refText || "Unknown";
            classDef += `  ${attr.name} : ${typeName}\n`;
        }
    }

    classDef += "}\n";
    return classDef;
}

function generateRelation(element: ElementRelation, currentModule: ContextModule, options: PlantUMLOptions, direction?: string, externalElements?: Set<ClassDeclaration>): string {
    let sourceName: string | undefined;
    let sourceContainer: ContextModule | undefined;

    if (element.firstEnd) {
        sourceName = element.firstEnd.ref?.name || element.firstEnd.$refText;
        // Try to determine container if resolved
        if (element.firstEnd.ref && isClassDeclaration(element.firstEnd.ref)) {
            sourceContainer = element.firstEnd.ref.$container;
        }
    } else if (isClassDeclaration(element.$container)) {
        // Inline relation, container is the source
        sourceName = element.$container.name;
        sourceContainer = element.$container.$container;
    }

    const target = element.secondEnd?.ref;
    const targetName = target?.name || element.secondEnd?.$refText;
    let targetContainer: ContextModule | undefined;
    if (target && isClassDeclaration(target)) {
        targetContainer = target.$container;
    }

    if (!sourceName || !targetName) return "";

    // Check external references
    const isSourceExternal = sourceContainer && sourceContainer !== currentModule;
    const isTargetExternal = targetContainer && targetContainer !== currentModule;
    const isExternal = isSourceExternal || isTargetExternal;

    if (externalElements) {
        if (isSourceExternal && element.firstEnd?.ref && isClassDeclaration(element.firstEnd.ref)) {
            externalElements.add(element.firstEnd.ref);
        }
        if (isTargetExternal && target && isClassDeclaration(target)) {
            externalElements.add(target);
        }
    }

    if (!options.showExternalReferences) {
        if (isExternal) {
            return "";
        }

        // If we have $refText and no ref, it's likely external or broken. Hide it to be safe?
        if ((!element.firstEnd?.ref && !isClassDeclaration(element.$container)) || !element.secondEnd?.ref) {
            return "";
        }
    }

    const sourceCard = element.firstCardinality ?
        (element.firstCardinality.upperBound !== undefined ? `"${element.firstCardinality.lowerBound}..${element.firstCardinality.upperBound}"` : `"${element.firstCardinality.lowerBound}"`) : "";
    const targetCard = element.secondCardinality ?
        (element.secondCardinality.upperBound !== undefined ? `"${element.secondCardinality.lowerBound}..${element.secondCardinality.upperBound}"` : `"${element.secondCardinality.lowerBound}"`) : "";

    const relationName = element.name ? `: <back:WhiteSmoke>${element.name}</back> >` : "";

    // Use longer arrows for external references to push them away
    const dash = direction ? (isExternal ? `-${direction}--` : `-${direction}-`) : (isExternal ? "----" : "--");

    let arrow = dash;
    if (element.isComposition) {
        arrow = `*${dash}`;
    } else if (element.isAggregation) {
        arrow = `o${dash}`;
    } else if (element.isCompositionInverted) {
        arrow = `${dash}*`;
    } else if (element.isAggregationInverted) {
        arrow = `${dash}o`;
    }

    return `"${sourceName}" ${sourceCard} ${arrow} ${targetCard} "${targetName}" ${relationName}\n`;
}
