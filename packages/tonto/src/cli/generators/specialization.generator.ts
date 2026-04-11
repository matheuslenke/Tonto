import chalk from "chalk";
import { Class, Package, Property, Relation } from "ontouml-js";
import { ClassDeclaration, ContextModule, DataType, ElementRelation, RelationMetaAttributes } from "../../language/index.js";
import { generalizationGenerator } from "./class.generator.js";
import { findGeneratedRelation, relationGeneralizationGenerator } from "./relation.generator.js";

export function generateDataTypeSpecializations(
    contextModule: ContextModule,
    classes: Class[],
    dataTypes: Class[],
    packageItem: Package
): void {
    const declaratedDataTypes = contextModule.declarations.filter((declaration) => declaration.$type === "DataType");

    declaratedDataTypes.forEach((declaration) => {
        const dataType = declaration as DataType;
        const sourceDataType = dataTypes.find((item) => item.id === dataType.name);
        if (!sourceDataType) {
            return;
        }
        dataType.specializationEndurants.forEach((endurant) => {
            let targetDataType = dataTypes.find((item) => item.id === endurant.ref?.name);
            if (!targetDataType) {
                targetDataType = classes.find((item) => item.id === endurant.ref?.name);
            }
            if (targetDataType) {
                generalizationGenerator(packageItem, sourceDataType, targetDataType);
            } else {
                console.log(
                    chalk.yellow(
                        `Warning: Could not create specialization between datatype ${dataType.name} and 
          ${endurant.ref?.name} not found in context module)`
                    )
                );
            }
        });
    });
}

export function generateSpecializations(
    contextModule: ContextModule,
    classes: Class[],
    relations: Relation[],
    packageItem: Package
): void {
    contextModule.declarations.forEach((declaration) => {
        if (declaration.$type === "ClassDeclaration") {
            const classElement = declaration as ClassDeclaration;
            if (classElement.specializationEndurants.length > 0) {
                const sourceClass = classes.find((item) => item.id === classElement.name);

                if (sourceClass) {
                    classElement.specializationEndurants.forEach((endurant) => {
                        const targetClass = classes.find((item) => item.id === endurant.ref?.name);
                        if (targetClass) {
                            generalizationGenerator(packageItem, targetClass, sourceClass);
                        } else {
                            console.log(
                                chalk.yellow(
                                    `Warning: Could not create specialization between class ${classElement.name} and 
                ${endurant.ref?.name} not found in context module ${contextModule.name})`
                                )
                            );
                        }
                    });
                } else {
                    console.log(
                        chalk.yellow(
                            `Warning: Could not create specializations for Class ${classElement.name} \
            because it was not found in context module ${contextModule.name})`
                        )
                    );
                }
            }
            generateInternalRelationSpecialization(classElement, relations, packageItem);
            generateInternalRelationEndReferences(classElement, relations);
            // Generate external ElementRelation specializations
        } else if (declaration.$type === "ElementRelation") {
            const elementRelation = declaration as ElementRelation;
            if (elementRelation.specializeRelation) {
                const elementRelationCreated = findGeneratedRelation(relations, elementRelation);
                const targetRelation = findGeneratedRelation(relations, elementRelation.specializeRelation.ref);

                if (elementRelationCreated && targetRelation) {
                    relationGeneralizationGenerator(packageItem, targetRelation, elementRelationCreated);
                } else {
                    console.log(
                        chalk.yellow(
                            `Warning: Could not create specializations for Relation ${elementRelation.name ?? "(No name)"} \
            because it was not found in context module ${contextModule.name})`
                        )
                    );
                }
            }

            generateRelationEndReferences(elementRelation, relations);
        }
    });
}

export function generateInternalRelationSpecialization(
    classElement: ClassDeclaration,
    relations: Relation[],
    packageItem: Package
) {
    classElement.references.forEach((element) => {
        if (element.$type === "ElementRelation") {
            const elementRelation = element as ElementRelation;
            if (elementRelation.specializeRelation) {
                const elementRelationCreated = findGeneratedRelation(relations, element, classElement);

                if (elementRelationCreated) {
                    const targetRelation = findGeneratedRelation(relations, elementRelation.specializeRelation.ref);

                    if (targetRelation) {
                        relationGeneralizationGenerator(packageItem, targetRelation, elementRelationCreated);
                    }
                }
            }
        }
    });
}

function generateInternalRelationEndReferences(classElement: ClassDeclaration, relations: Relation[]) {
    classElement.references.forEach((element) => {
        if (element.$type === "ElementRelation") {
            generateRelationEndReferences(element, relations, classElement);
        }
    });
}

function generateRelationEndReferences(
    elementRelation: ElementRelation,
    relations: Relation[],
    sourceClassIncoming?: ClassDeclaration
) {
    const createdRelation = findGeneratedRelation(relations, elementRelation, sourceClassIncoming);
    if (!createdRelation) {
        return;
    }

    assignRelationEndOverrides(elementRelation.firstEndMetaAttributes, createdRelation, relations);
    assignRelationEndOverrides(elementRelation.secondEndMetaAttributes, createdRelation, relations);
}

function assignRelationEndOverrides(
    metaAttributes: RelationMetaAttributes | undefined,
    createdRelation: Relation,
    relations: Relation[]
) {
    if (!metaAttributes) {
        return;
    }

    const createdProperty = getCreatedPropertyFromMetaAttributes(createdRelation, metaAttributes);
    if (!createdProperty) {
        return;
    }

    metaAttributes.endMetaAttributes.forEach((metaAttribute) => {
        const subsettedProperty = findReferencedProperty(metaAttribute.subsetRelation?.ref, relations);
        if (subsettedProperty && !createdProperty.subsettedProperties.some((property) => property.id === subsettedProperty.id)) {
            createdProperty.subsettedProperties.push(subsettedProperty);
        }

        const redefinedProperty = findReferencedProperty(metaAttribute.redefinesRelation?.ref, relations);
        if (redefinedProperty && !createdProperty.redefinedProperties.some((property) => property.id === redefinedProperty.id)) {
            createdProperty.redefinedProperties.push(redefinedProperty);
        }
    });
}

function findReferencedProperty(
    metaAttributes: RelationMetaAttributes | undefined,
    relations: Relation[]
): Property | undefined {
    if (!metaAttributes) {
        return undefined;
    }

    const referencedRelation = findGeneratedRelation(relations, metaAttributes.$container);
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
