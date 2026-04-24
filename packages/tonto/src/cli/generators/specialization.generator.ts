import { Class, Package, Property, Relation } from "ontouml-js";
import {
    ClassDeclaration,
    ContextModule,
    DataType,
    ElementRelation,
    RelationMetaAttributes,
    isClassDeclaration,
    isDataType,
} from "../../language/index.js";
import {
    JSON_GENERATION_STEPS,
    createJsonGenerationError,
    createJsonGenerationNodeInfo,
} from "../requests/jsonGeneration.js";
import { generalizationGenerator } from "./class.generator.js";
import { findGeneratedRelation, relationGeneralizationGenerator } from "./relation.generator.js";

export function generateDataTypeSpecializations(
    contextModule: ContextModule,
    classes: Class[],
    dataTypes: Class[],
    packageItem: Package,
    resolveClass?: (classDeclaration: ClassDeclaration | undefined) => Class | undefined,
    resolveDataType?: (dataType: DataType | undefined) => Class | undefined
): void {
    const declaratedDataTypes = contextModule.declarations.filter((declaration) => declaration.$type === "DataType");

    declaratedDataTypes.forEach((declaration) => {
        const dataType = declaration as DataType;
        const sourceDataType = dataTypes.find((item) => item.id === dataType.name);
        if (!sourceDataType) {
            throw createJsonGenerationError(`Could not generate datatype specializations for "${dataType.name}".`, {
                step: JSON_GENERATION_STEPS.specializationGeneration,
                info: [
                    createJsonGenerationNodeInfo(dataType, {
                        code: "missing_source_datatype",
                        title: "Datatype was not generated",
                        description: `Datatype "${dataType.name}" was not available in the generated OntoUML model before its specializations were processed.`,
                    }),
                ],
            });
        }
        dataType.specializationEndurants.forEach((endurant) => {
            let targetDataType = isDataType(endurant.ref)
                ? resolveDataType?.(endurant.ref)
                : undefined;
            if (!targetDataType && isClassDeclaration(endurant.ref)) {
                targetDataType = resolveClass?.(endurant.ref);
            }
            if (!targetDataType) {
                targetDataType = dataTypes.find((item) => item.id === endurant.ref?.name);
            }
            if (!targetDataType) {
                targetDataType = classes.find((item) => item.id === endurant.ref?.name);
            }
            if (targetDataType) {
                generalizationGenerator(packageItem, sourceDataType, targetDataType);
            } else {
                throw createJsonGenerationError(`Could not generate datatype specializations for "${dataType.name}".`, {
                    step: JSON_GENERATION_STEPS.specializationGeneration,
                    info: [
                        createJsonGenerationNodeInfo(dataType, {
                            code: "missing_specialization_target",
                            title: "Unresolved datatype specialization target",
                            description: `Datatype "${dataType.name}" specializes "${endurant.$refText ?? endurant.ref?.name ?? "(unknown)"}", but that target was not generated.`,
                        }),
                    ],
                });
            }
        });
    });
}

export function generateSpecializations(
    contextModule: ContextModule,
    classes: Class[],
    relations: Relation[],
    packageItem: Package,
    resolveClass?: (classDeclaration: ClassDeclaration | undefined) => Class | undefined,
    resolveRelation?: (relationItem: ElementRelation | undefined) => Relation | undefined
): void {
    contextModule.declarations.forEach((declaration) => {
        if (declaration.$type === "ClassDeclaration") {
            const classElement = declaration as ClassDeclaration;
            if (classElement.specializationEndurants.length > 0) {
                const sourceClass = resolveClass?.(classElement)
                    ?? classes.find((item) => item.id === classElement.name);

                if (!sourceClass) {
                    throw createJsonGenerationError(`Could not generate class specializations for "${classElement.name}".`, {
                        step: JSON_GENERATION_STEPS.specializationGeneration,
                        info: [
                            createJsonGenerationNodeInfo(classElement, {
                                code: "missing_source_class",
                                title: "Class was not generated",
                                description: `Class "${classElement.name}" in package "${contextModule.name}" was not available in the generated OntoUML model before its specializations were processed.`,
                            }),
                        ],
                    });
                }

                classElement.specializationEndurants.forEach((endurant) => {
                    const targetClass = resolveClass?.(endurant.ref)
                        ?? classes.find((item) => item.id === endurant.ref?.name);
                    if (targetClass) {
                        generalizationGenerator(packageItem, targetClass, sourceClass);
                    } else {
                        throw createJsonGenerationError(`Could not generate class specializations for "${classElement.name}".`, {
                            step: JSON_GENERATION_STEPS.specializationGeneration,
                            info: [
                                createJsonGenerationNodeInfo(classElement, {
                                    code: "missing_specialization_target",
                                    title: "Unresolved class specialization target",
                                    description: `Class "${classElement.name}" specializes "${endurant.$refText ?? endurant.ref?.name ?? "(unknown)"}", but that target was not generated in package "${contextModule.name}".`,
                                }),
                            ],
                        });
                    }
                });
            }
            generateInternalRelationSpecialization(classElement, relations, packageItem, resolveRelation);
            generateInternalRelationEndReferences(classElement, relations, resolveRelation);
            // Generate external ElementRelation specializations
        } else if (declaration.$type === "ElementRelation") {
            const elementRelation = declaration as ElementRelation;
            if (elementRelation.specializeRelation) {
                const elementRelationCreated = findGeneratedRelation(relations, elementRelation, undefined, resolveRelation);
                const targetRelation = findGeneratedRelation(relations, elementRelation.specializeRelation.ref, undefined, resolveRelation);

                if (elementRelationCreated && targetRelation) {
                    relationGeneralizationGenerator(packageItem, targetRelation, elementRelationCreated);
                } else {
                    throw createJsonGenerationError(`Could not generate relation specializations for "${elementRelation.name ?? "(unnamed relation)"}".`, {
                        step: JSON_GENERATION_STEPS.specializationGeneration,
                        info: [
                            createJsonGenerationNodeInfo(elementRelation, {
                                code: "missing_relation_specialization",
                                title: "Unresolved relation specialization",
                                description: `Relation "${elementRelation.name ?? "(unnamed relation)"}" in package "${contextModule.name}" could not resolve the specialized relation or the generated relation instance.`,
                            }),
                        ],
                    });
                }
            }

            generateRelationEndReferences(elementRelation, relations, undefined, resolveRelation);
        }
    });
}

export function generateInternalRelationSpecialization(
    classElement: ClassDeclaration,
    relations: Relation[],
    packageItem: Package,
    resolveRelation?: (relationItem: ElementRelation | undefined) => Relation | undefined
) {
    classElement.references.forEach((element) => {
        if (element.$type === "ElementRelation") {
            const elementRelation = element as ElementRelation;
            if (elementRelation.specializeRelation) {
                const elementRelationCreated = findGeneratedRelation(relations, element, classElement, resolveRelation);

                if (!elementRelationCreated) {
                    throw createJsonGenerationError(`Could not generate relation specializations for "${elementRelation.name ?? "(unnamed relation)"}".`, {
                        step: JSON_GENERATION_STEPS.specializationGeneration,
                        info: [
                            createJsonGenerationNodeInfo(elementRelation, {
                                code: "missing_internal_relation",
                                title: "Relation was not generated",
                                description: `Internal relation "${elementRelation.name ?? "(unnamed relation)"}" in class "${classElement.name}" was not generated before its specialization was processed.`,
                            }),
                        ],
                    });
                }

                const targetRelation = findGeneratedRelation(
                    relations,
                    elementRelation.specializeRelation.ref,
                    undefined,
                    resolveRelation
                );

                if (!targetRelation) {
                    throw createJsonGenerationError(`Could not generate relation specializations for "${elementRelation.name ?? "(unnamed relation)"}".`, {
                        step: JSON_GENERATION_STEPS.specializationGeneration,
                        info: [
                            createJsonGenerationNodeInfo(elementRelation, {
                                code: "missing_relation_specialization_target",
                                title: "Unresolved relation specialization target",
                                description: `Relation "${elementRelation.name ?? "(unnamed relation)"}" specializes "${elementRelation.specializeRelation.$refText ?? elementRelation.specializeRelation.ref?.name ?? "(unknown)"}", but that target relation was not generated.`,
                            }),
                        ],
                    });
                }

                relationGeneralizationGenerator(packageItem, targetRelation, elementRelationCreated);
            }
        }
    });
}

function generateInternalRelationEndReferences(
    classElement: ClassDeclaration,
    relations: Relation[],
    resolveRelation?: (relationItem: ElementRelation | undefined) => Relation | undefined
) {
    classElement.references.forEach((element) => {
        if (element.$type === "ElementRelation") {
            generateRelationEndReferences(element, relations, classElement, resolveRelation);
        }
    });
}

function generateRelationEndReferences(
    elementRelation: ElementRelation,
    relations: Relation[],
    sourceClassIncoming?: ClassDeclaration,
    resolveRelation?: (relationItem: ElementRelation | undefined) => Relation | undefined
) {
    const createdRelation = findGeneratedRelation(relations, elementRelation, sourceClassIncoming, resolveRelation);
    if (!createdRelation) {
        throw createJsonGenerationError(`Could not apply end overrides for "${elementRelation.name ?? "(unnamed relation)"}".`, {
            step: JSON_GENERATION_STEPS.specializationGeneration,
            info: [
                createJsonGenerationNodeInfo(elementRelation, {
                    code: "missing_relation_for_end_override",
                    title: "Relation was not generated",
                    description: `Relation "${elementRelation.name ?? "(unnamed relation)"}" was not generated before subset/redefine end overrides were processed.`,
                }),
            ],
        });
    }

    assignRelationEndOverrides(elementRelation.firstEndMetaAttributes, createdRelation, relations, resolveRelation);
    assignRelationEndOverrides(elementRelation.secondEndMetaAttributes, createdRelation, relations, resolveRelation);
}

function assignRelationEndOverrides(
    metaAttributes: RelationMetaAttributes | undefined,
    createdRelation: Relation,
    relations: Relation[],
    resolveRelation?: (relationItem: ElementRelation | undefined) => Relation | undefined
) {
    if (!metaAttributes) {
        return;
    }

    const createdProperty = getCreatedPropertyFromMetaAttributes(createdRelation, metaAttributes);
    if (!createdProperty) {
        throw createJsonGenerationError("Could not apply relation end overrides.", {
            step: JSON_GENERATION_STEPS.specializationGeneration,
            info: [
                createJsonGenerationNodeInfo(metaAttributes, {
                    code: "missing_relation_end",
                    title: "Relation end was not generated",
                    description: "The referenced relation end could not be determined before subset/redefine overrides were applied.",
                }),
            ],
        });
    }

    metaAttributes.endMetaAttributes.forEach((metaAttribute) => {
        const subsettedProperty = findReferencedProperty(metaAttribute.subsetRelation?.ref, relations, resolveRelation);
        if (metaAttribute.subsetRelation && !subsettedProperty) {
            throw createJsonGenerationError("Could not apply subset relation override.", {
                step: JSON_GENERATION_STEPS.specializationGeneration,
                info: [
                    createJsonGenerationNodeInfo(metaAttributes, {
                        code: "missing_subsetted_property",
                        title: "Unresolved subsetted property",
                        description: `The relation end override refers to "${metaAttribute.subsetRelation.$refText ?? "(unknown)"}", but that referenced relation end was not generated.`,
                    }),
                ],
            });
        }

        if (subsettedProperty && isSamePropertyReference(createdProperty, subsettedProperty)) {
            throw createJsonGenerationError("Could not apply subset relation override.", {
                step: JSON_GENERATION_STEPS.specializationGeneration,
                info: [
                    createJsonGenerationNodeInfo(metaAttributes, {
                        code: "self_subsetted_property",
                        title: "Relation end cannot subset itself",
                        description: `Relation end "${createdProperty.getName() ?? createdProperty.id}" cannot subset itself.`,
                    }),
                ],
            });
        }

        if (subsettedProperty && !createdProperty.subsettedProperties.some((property) => property.id === subsettedProperty.id)) {
            createdProperty.subsettedProperties.push(subsettedProperty);
        }

        const redefinedProperty = findReferencedProperty(metaAttribute.redefinesRelation?.ref, relations, resolveRelation);
        if (metaAttribute.redefinesRelation && !redefinedProperty) {
            throw createJsonGenerationError("Could not apply redefines relation override.", {
                step: JSON_GENERATION_STEPS.specializationGeneration,
                info: [
                    createJsonGenerationNodeInfo(metaAttributes, {
                        code: "missing_redefined_property",
                        title: "Unresolved redefined property",
                        description: `The relation end override refers to "${metaAttribute.redefinesRelation.$refText ?? "(unknown)"}", but that referenced relation end was not generated.`,
                    }),
                ],
            });
        }

        if (redefinedProperty && isSamePropertyReference(createdProperty, redefinedProperty)) {
            throw createJsonGenerationError("Could not apply redefines relation override.", {
                step: JSON_GENERATION_STEPS.specializationGeneration,
                info: [
                    createJsonGenerationNodeInfo(metaAttributes, {
                        code: "self_redefined_property",
                        title: "Relation end cannot redefine itself",
                        description: `Relation end "${createdProperty.getName() ?? createdProperty.id}" cannot redefine itself.`,
                    }),
                ],
            });
        }

        if (redefinedProperty && !createdProperty.redefinedProperties.some((property) => property.id === redefinedProperty.id)) {
            createdProperty.redefinedProperties.push(redefinedProperty);
        }
    });
}

function findReferencedProperty(
    metaAttributes: RelationMetaAttributes | undefined,
    relations: Relation[],
    resolveRelation?: (relationItem: ElementRelation | undefined) => Relation | undefined
): Property | undefined {
    if (!metaAttributes) {
        return undefined;
    }

    const referencedRelation = findGeneratedRelation(relations, metaAttributes.$container, undefined, resolveRelation);
    if (!referencedRelation) {
        return undefined;
    }

    return getCreatedPropertyFromMetaAttributes(referencedRelation, metaAttributes);
}

function getCreatedPropertyFromMetaAttributes(
    relation: Relation,
    metaAttributes: RelationMetaAttributes
): Property | undefined {
    const relationDeclaration = metaAttributes.$container;
    if (relationDeclaration.firstEndMetaAttributes === metaAttributes) {
        return relation.getSourceEnd();
    }

    if (relationDeclaration.secondEndMetaAttributes === metaAttributes) {
        return relation.getTargetEnd();
    }

    return undefined;
}

function isSamePropertyReference(left: Property, right: Property): boolean {
    if (left === right) {
        return true;
    }

    if (left.id && right.id) {
        return left.id === right.id;
    }

    return false;
}
