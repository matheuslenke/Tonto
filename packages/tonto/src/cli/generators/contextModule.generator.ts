import { Class, Package, Relation } from "ontouml-js";
import { ClassDeclaration, ContextModule, DataType, ElementRelation, GeneralizationSet } from "../../language/index.js";
import { attributeGenerator } from "./attribute.generator.js";
import { classElementGenerator } from "./class.generator.js";
import { customDataTypeGenerator } from "./datatype.generator.js";
import { enumGenerator } from "./enum.generator.js";
import { generalizationSetGenerator } from "./genset.generator.js";
import { generateInstantiations } from "./instantiation.generator.js";
import { relationGenerator } from "./relation.generator.js";
import { generateDataTypeSpecializations, generateSpecializations } from "./specialization.generator.js";

export function contextModuleGenerator(contextModule: ContextModule, packageItem: Package): void {
    const classes: Class[] = [];
    const dataTypes: Class[] = [];
    const relations: Relation[] = [];

    // Phase 1: Create all classes and datatypes first
    generateClassesAndDataTypes(contextModule, packageItem, classes, dataTypes);

    // Phase 2: Create relations (requires all classes to exist)
    generateInternalRelations(contextModule, classes, relations, packageItem);
    generateExternalRelations(contextModule, classes, relations, packageItem);

    // Phase 3: Create specializations and other dependent elements (requires relations to exist)
    generateGenSets(contextModule, classes, packageItem);
    generateSpecializations(contextModule, classes, relations, packageItem);
    generateDataTypeSpecializations(contextModule, classes, dataTypes, packageItem);

    // Phase 4: Generate instantiations (requires everything else)
    generateInstantiations(contextModule, classes, relations, packageItem);
}

function generateClassesAndDataTypes(
    contextModule: ContextModule,
    packageItem: Package,
    classes: Class[],
    dataTypes: Class[]
): void {
    contextModule.declarations.forEach((declaration) => {
        switch (declaration.$type) {
            case "ClassDeclaration": {
                const classElement = declaration as ClassDeclaration;
                const newClass = classElementGenerator(classElement, packageItem);
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
                    dataTypes.push(newDataType);
                }
                break;
            }
        }
    });

    // After all classes and datatypes are created, generate attributes
    generateClassAttributes(contextModule, classes, dataTypes);
    generateDataTypeAttributes(contextModule, dataTypes);
}

function generateClassAttributes(contextModule: ContextModule, classes: Class[], dataTypes: Class[]): void {
    contextModule.declarations.forEach((declaration) => {
        if (declaration.$type === "ClassDeclaration") {
            const classDeclaration = declaration as ClassDeclaration;
            const createdClass = classes.find((item) => item.getName() === classDeclaration.name);
            if (createdClass) {
                attributeGenerator(classDeclaration, createdClass, dataTypes);
            }
        }
    });
}

function generateDataTypeAttributes(contextModule: ContextModule, dataTypes: Class[]): void {
    contextModule.declarations.forEach((declaration) => {
        if (declaration.$type === "DataType") {
            const dataType = declaration as DataType;
            const createdDataType = dataTypes.find((item) => item.getNameOrId() === dataType.name);
            if (createdDataType) {
                attributeGenerator(dataType, createdDataType, dataTypes);
            }
        }
    });
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
