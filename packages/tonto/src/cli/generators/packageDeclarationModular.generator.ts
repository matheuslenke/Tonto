import { Class, Package, Relation } from "ontouml-js";
import {
    ClassDeclaration,
    DataType,
    ElementRelation,
    GeneralizationSet,
    PackageDeclaration,
} from "../../language/generated/ast.js";
import { attributeGenerator } from "./attribute.generator.js";
import { classElementGenerator } from "./class.generator.js";
import { customDataTypeAttributesGenerator, customDataTypeGenerator } from "./datatype.generator.js";
import { enumGenerator } from "./enum.generator.js";
import { generalizationSetGenerator } from "./genset.generator.js";
import { generateInstantiations } from "./instantiation.generator.js";
import { relationGenerator } from "./relation.generator.js";
import { generateDataTypeSpecializations, generateSpecializations } from "./specialization.generator.js";

export interface GeneratedPackageDeclarationData {
    classes: Class[];
    dataTypes: Class[];
    enums: Class[];
    relations: Relation[];
}

export function PackageDeclarationGenerateClasses(
    PackageDeclaration: PackageDeclaration,
    packageItem: Package
): GeneratedPackageDeclarationData {
    const returnData: GeneratedPackageDeclarationData = {
        classes: [],
        dataTypes: [],
        enums: [],
        relations: [],
    };

    PackageDeclaration.declarations.forEach((declaration) => {
        switch (declaration.$type) {
            case "ClassDeclaration": {
                const classElement = declaration as ClassDeclaration;
                const newClass = classElementGenerator(classElement, packageItem);
                returnData.classes.push(newClass);
                break;
            }

            case "DataType": {
                const dataType = declaration as DataType;
                if (dataType.isEnum) {
                    const newEnum = enumGenerator(dataType, packageItem);
                    returnData.dataTypes.push(newEnum);
                } else {
                    const newDataType = customDataTypeGenerator(dataType, packageItem);
                    returnData.dataTypes.push(newDataType);
                }
                break;
            }
        }
    });

    return returnData;
}

export function PackageDeclarationGenerateRelations(
    PackageDeclaration: PackageDeclaration,
    packageItem: Package,
    modelData: GeneratedPackageDeclarationData,
    importedData: GeneratedPackageDeclarationData[]
): void {
    const classes: Class[] = [...modelData.classes];
    classes.push(...importedData.flatMap((data) => data.classes));

    const internalRelations = generateInternalRelations(PackageDeclaration, classes, packageItem);
    const externalRelations = generateExternalRelations(PackageDeclaration, classes, packageItem);
    modelData.relations.push(...internalRelations, ...externalRelations);
}

export function PackageDeclarationModularGenerator(
    PackageDeclaration: PackageDeclaration,
    modelData: GeneratedPackageDeclarationData,
    packageItem: Package,
    importedData: GeneratedPackageDeclarationData[]
): void {
    const classes: Class[] = [...modelData.classes];
    const dataTypes: Class[] = [...modelData.dataTypes];
    const relations: Relation[] = [...modelData.relations];

    // Adding Elements from imports
    classes.push(...importedData.flatMap((data) => data.classes));
    dataTypes.push(...importedData.flatMap((data) => data.dataTypes));
    relations.push(...importedData.flatMap((data) => data.relations));

    generateGenSets(PackageDeclaration, classes, packageItem);
    generateComplexDataTypesAttributes(PackageDeclaration, dataTypes);
    generateSpecializations(PackageDeclaration, classes, relations, packageItem);
    generateClassDeclarationAttributes(PackageDeclaration, classes, dataTypes);
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

function generateClassDeclarationAttributes(PackageDeclaration: PackageDeclaration, classes: Class[], dataTypes: Class[]): void {
    PackageDeclaration.declarations.forEach((declaration) => {
        switch (declaration.$type) {
            case "ClassDeclaration": {
                const classDeclaration = declaration as ClassDeclaration;
                const createdClass = classes.find((item) => item.getName() === classDeclaration.id);
                if (createdClass) {
                    attributeGenerator(classDeclaration, createdClass, dataTypes);
                }
            }
        }
    });
}

function generateExternalRelations(PackageDeclaration: PackageDeclaration, classes: Class[], packageItem: Package): Relation[] {
    const relations: Relation[] = [];
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
    return relations;
}

function generateInternalRelations(PackageDeclaration: PackageDeclaration, classes: Class[], packageItem: Package): Relation[] {
    const relations: Relation[] = [];
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
    return relations;
}

function generateComplexDataTypesAttributes(PackageDeclaration: PackageDeclaration, dataTypes: Class[]): void {
    PackageDeclaration.declarations.forEach((declaration) => {
        if (declaration.$type === "DataType") {
            const dataType = declaration as DataType;
            customDataTypeAttributesGenerator(dataType, dataTypes);
        }
    });
}
