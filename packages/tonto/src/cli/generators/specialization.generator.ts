import chalk from "chalk";
import { Class, Package, Relation } from "ontouml-js";
import { ClassDeclaration, DataType, ElementRelation, PackageDeclaration } from "../../language/index.js";
import { generalizationGenerator } from "./class.generator.js";
import { relationGeneralizationGenerator } from "./relation.generator.js";

export function generateDataTypeSpecializations(
    PackageDeclaration: PackageDeclaration,
    classes: Class[],
    dataTypes: Class[],
    packageItem: Package
): void {
    const declaratedDataTypes = PackageDeclaration.declarations.filter((declaration) => declaration.$type === "DataType");

    declaratedDataTypes.forEach((declaration) => {
        const dataType = declaration as DataType;
        const sourceDataType = dataTypes.find((item) => item.getNameOrId() === dataType.id);
        if (!sourceDataType) {
            return;
        }
        dataType.specializationEndurants.forEach((endurant) => {
            let targetDataType = dataTypes.find((item) => item.getNameOrId() === endurant.ref?.id);
            if (!targetDataType) {
                targetDataType = classes.find((item) => item.getNameOrId() === endurant.ref?.id);
            }
            if (targetDataType) {
                generalizationGenerator(packageItem, sourceDataType, targetDataType);
            } else {
                console.log(
                    chalk.yellow(
                        `Warning: Could not create specialization between datatype ${dataType.id} and 
          ${endurant.ref?.id} not found in context module)`
                    )
                );
            }
        });
    });
}

export function generateSpecializations(
    PackageDeclaration: PackageDeclaration,
    classes: Class[],
    relations: Relation[],
    packageItem: Package
): void {
    PackageDeclaration.declarations.forEach((declaration) => {
        if (declaration.$type === "ClassDeclaration") {
            const classElement = declaration as ClassDeclaration;
            if (classElement.specializationEndurants.length > 0) {
                const sourceClass = classes.find((item) => item.name.getText() === classElement.id);

                if (sourceClass) {
                    classElement.specializationEndurants.forEach((endurant) => {
                        const targetClass = classes.find((item) => item.name.getText() === endurant.ref?.id);
                        if (targetClass) {
                            generalizationGenerator(packageItem, targetClass, sourceClass);
                            generateInternalRelationSpecialization(classElement, relations, packageItem);
                        } else {
                            console.log(
                                chalk.yellow(
                                    `Warning: Could not create specialization between class ${classElement.id} and 
                ${endurant.ref?.id} not found in context module ${PackageDeclaration.id})`
                                )
                            );
                        }
                    });
                } else {
                    console.log(
                        chalk.yellow(
                            `Warning: Could not create specializations for Class ${classElement.id} \
            because it was not found in context module ${PackageDeclaration.id})`
                        )
                    );
                }
            }
            // Generate external ElementRelation specializations
        } else if (declaration.$type === "ElementRelation") {
            const elementRelation = declaration as ElementRelation;
            if (elementRelation.specializeRelation) {
                const elementRelationCreated = relations.find((item) => item.name.getText() === elementRelation.id);
                const targetRelation = relations.find(
                    (item) => item.name.getText() === elementRelation.specializeRelation?.ref?.id
                );

                if (elementRelationCreated && targetRelation) {
                    relationGeneralizationGenerator(packageItem, elementRelationCreated, targetRelation);
                } else {
                    console.log(
                        chalk.yellow(
                            `Warning: Could not create specializations for Relation ${elementRelation.id ?? "(No name)"} \
            because it was not found in context module ${PackageDeclaration.id})`
                        )
                    );
                }
            }
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
                const elementRelationCreated = relations.find((item) => item.name.getText() === elementRelation.id);

                if (elementRelationCreated) {
                    const targetRelation = relations.find(
                        (item) => item.name.getText() === elementRelation.specializeRelation?.ref?.id
                    );

                    if (targetRelation) {
                        relationGeneralizationGenerator(packageItem, elementRelationCreated, targetRelation);
                    }
                }
            }
        }
    });
}
