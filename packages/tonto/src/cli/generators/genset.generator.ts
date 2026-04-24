import { Class, GeneralizationSet, Package } from "ontouml-js";
import {
    ClassDeclaration,
    ClassDeclarationOrRelation,
    GeneralizationSet as GenSetData,
    isClassDeclaration,
} from "../../language/generated/ast.js";
import {
    JSON_GENERATION_STEPS,
    createJsonGenerationError,
    createJsonGenerationNodeInfo,
} from "../requests/jsonGeneration.js";

export function generalizationSetGenerator(
    enumData: GenSetData,
    classes: Class[],
    model: Package,
    resolveClass?: (classDeclaration: ClassDeclaration | undefined) => Class | undefined
): GeneralizationSet | undefined {
    const generalItem = resolveGeneratedClass(enumData.generalItem?.ref, classes, resolveClass);
    if (!generalItem) {
        throw createJsonGenerationError(`Could not generate generalization set "${enumData.name ?? "(unnamed generalization set)"}".`, {
            step: JSON_GENERATION_STEPS.generalizationSetGeneration,
            info: [
                createJsonGenerationNodeInfo(enumData, {
                    code: "missing_generalization_set_general",
                    title: "Unresolved general item",
                    description: `Generalization set "${enumData.name ?? "(unnamed generalization set)"}" refers to general "${enumData.generalItem?.$refText ?? enumData.generalItem?.ref?.name ?? "(unknown)"}", but that class was not generated.`,
                }),
            ],
        });
    }

    const unresolvedSpecifics = enumData.specificItems
        .filter((specificElement) => !resolveGeneratedClass(specificElement.ref, classes, resolveClass))
        .map((specificElement) => specificElement.$refText ?? specificElement.ref?.name ?? "(unknown)");

    if (unresolvedSpecifics.length > 0) {
        throw createJsonGenerationError(`Could not generate generalization set "${enumData.name ?? "(unnamed generalization set)"}".`, {
            step: JSON_GENERATION_STEPS.generalizationSetGeneration,
            info: [
                createJsonGenerationNodeInfo(enumData, {
                    code: "missing_generalization_set_specific",
                    title: "Unresolved specific item",
                    description: `Generalization set "${enumData.name ?? "(unnamed generalization set)"}" could not resolve the following specifics: ${unresolvedSpecifics.join(", ")}.`,
                }),
            ],
        });
    }

    const specifics: Class[] = enumData.specificItems
        .map((specificElement) => resolveGeneratedClass(specificElement.ref, classes, resolveClass))
        .filter((item): item is Class => item !== undefined);

    return model.createGeneralizationSetFromClasses(
        generalItem,
        specifics,
        enumData.disjoint,
        enumData.complete,
        enumData.name
    );
}

function resolveGeneratedClass(
    declaration: ClassDeclarationOrRelation | undefined,
    classes: Class[],
    resolveClass?: (classDeclaration: ClassDeclaration | undefined) => Class | undefined
): Class | undefined {
    if (!declaration || !isClassDeclaration(declaration)) {
        return undefined;
    }

    return resolveClass?.(declaration) ?? classes.find((item) => item.id === declaration.name);
}
