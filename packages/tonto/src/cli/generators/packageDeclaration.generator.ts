import { Class, Package, Relation } from "ontouml-js";
import { ClassDeclaration, DataType, ElementRelation, GeneralizationSet, PackageDeclaration } from "../../language/index.js";
import { attributeGenerator } from "./attribute.generator.js";
import { classElementGenerator } from "./class.generator.js";
import { customDataTypeGenerator } from "./datatype.generator.js";
import { enumGenerator } from "./enum.generator.js";
import { generalizationSetGenerator } from "./genset.generator.js";
import { generateInstantiations } from "./instantiation.generator.js";
import { relationGenerator } from "./relation.generator.js";
import { generateDataTypeSpecializations, generateSpecializations } from "./specialization.generator.js";

export function PackageDeclarationGenerator(PackageDeclaration: PackageDeclaration, packageItem: Package): void {
    const classes: Class[] = [];
    const dataTypes: Class[] = [];
    const relations: Relation[] = [];
    // Creating base datatypes

    PackageDeclaration.declarations.forEach((declaration) => {
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

    generateGenSets(PackageDeclaration, classes, packageItem);
    generateInternalRelations(PackageDeclaration, classes, relations, packageItem);
    generateExternalRelations(PackageDeclaration, classes, relations, packageItem);
    generateSpecializations(PackageDeclaration, classes, relations, packageItem);
    generateDataTypeSpecializations(PackageDeclaration, classes, dataTypes, packageItem);

    generateInstantiations(PackageDeclaration, classes, relations, packageItem);
}

function generateGenSets(PackageDeclaration: PackageDeclaration, classes: Class[], packageItem: Package) {
    PackageDeclaration.declarations.forEach((declaration) => {
        if (declaration.$type === "GeneralizationSet") {
            const gensetData = declaration as GeneralizationSet;
            generalizationSetGenerator(gensetData, classes, packageItem);
        }
    });
}

function generateExternalRelations(
    PackageDeclaration: PackageDeclaration,
    classes: Class[],
    relations: Relation[],
    packageItem: Package
): void {
    PackageDeclaration.declarations.forEach((declaration) => {
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
    PackageDeclaration: PackageDeclaration,
    classes: Class[],
    relations: Relation[],
    packageItem: Package
): void {
    PackageDeclaration.declarations.forEach((declaration) => {
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
