import { Class, Package, Relation } from "ontouml-js";
import { ClassDeclaration, DataType, ContextModule, ElementRelation, GeneralizationSet } from "../../language/index.js";
import { classElementGenerator } from "./class.generator.js";
import { customDataTypeGenerator } from "./datatype.generator.js";
import { enumGenerator } from "./enum.generator.js";
import { generalizationSetGenerator } from "./genset.generator.js";
import { generateInstantiations } from "./instantiation.generator.js";
import { relationGenerator } from "./relation.generator.js";
import { generateDataTypeSpecializations, generateSpecializations } from "./specialization.generator.js";
import { attributeGenerator } from "./attribute.generator.js";

export function contextModuleGenerator(contextModule: ContextModule, packageItem: Package): void {
    const classes: Class[] = [];
    const dataTypes: Class[] = [];
    const relations: Relation[] = [];
    // Creating base datatypes

    contextModule.declarations.forEach((declaration) => {
        switch (declaration.$type) {
            case "ClassDeclaration": {
                const classElement = declaration as ClassDeclaration;
                const newClass = classElementGenerator(classElement, packageItem);
                attributeGenerator(classElement, newClass, dataTypes);
                classes.push(newClass);
                break;
            }

            case "DataType": {
                const dataType = declaration as DataType;
                if (dataType.isEnum) {
                    const newEnum = enumGenerator(dataType, packageItem);
                    dataTypes.push(newEnum);
                } else {
                    const newDataType = customDataTypeGenerator(dataType, packageItem);
                    attributeGenerator(dataType, newDataType, dataTypes);
                    dataTypes.push(newDataType);
                }
                break;
            }
        }
    });

    generateGenSets(contextModule, classes, packageItem);
    generateInternalRelations(contextModule, classes, relations, packageItem);
    generateExternalRelations(contextModule, classes, relations, packageItem);
    generateSpecializations(contextModule, classes, relations, packageItem);
    generateDataTypeSpecializations(contextModule, classes, dataTypes, packageItem);

    generateInstantiations(contextModule, classes, relations, packageItem);
}

function generateGenSets(contextModule: ContextModule, classes: Class[], packageItem: Package) {
    contextModule.declarations.forEach((declaration) => {
        if (declaration.$type === "GeneralizationSet") {
            const gensetData = declaration as GeneralizationSet;
            generalizationSetGenerator(gensetData, classes, packageItem);
        }
    });
}

function generateExternalRelations(
    contextModule: ContextModule,
    classes: Class[],
    relations: Relation[],
    packageItem: Package
): void {
    contextModule.declarations.forEach((declaration) => {
        switch (declaration.$type) {
            case "ElementRelation": {
                const elementRelation = declaration as ElementRelation;
                const createdRelation = relationGenerator(elementRelation, packageItem, classes);
                if (createdRelation) {
                    relations.push(createdRelation);
                }
            }
        }
    });
}

function generateInternalRelations(
    contextModule: ContextModule,
    classes: Class[],
    relations: Relation[],
    packageItem: Package
): void {
    contextModule.declarations.forEach((declaration) => {
        if (declaration.$type === "ClassDeclaration") {
            const classDeclaration = declaration as ClassDeclaration;

            classDeclaration.references.forEach((reference) => {
                const createdRelation = relationGenerator(reference, packageItem, classes, classDeclaration);
                if (createdRelation) {
                    relations.push(createdRelation);
                }
            });
        }
    });
}
