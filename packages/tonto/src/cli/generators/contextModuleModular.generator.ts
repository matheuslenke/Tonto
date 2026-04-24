import { Class, Package, Relation } from "ontouml-js";
import {
    ClassDeclaration,
    ContextModule,
    DataType,
    ElementRelation,
    GeneralizationSet,
} from "../../language/generated/ast.js";
import { attributeGenerator } from "./attribute.generator.js";
import { classElementGenerator } from "./class.generator.js";
import { customDataTypeAttributesGenerator, customDataTypeGenerator } from "./datatype.generator.js";
import { enumGenerator } from "./enum.generator.js";
import { generalizationSetGenerator } from "./genset.generator.js";
import { generateInstantiations } from "./instantiation.generator.js";
import { relationGenerator } from "./relation.generator.js";
import { generateDataTypeSpecializations, generateSpecializations } from "./specialization.generator.js";
import {
    JSON_GENERATION_STEPS,
    createJsonGenerationError,
    createJsonGenerationNodeInfo,
} from "../requests/jsonGeneration.js";

export interface GeneratedContextModuleData {
    classes: Class[];
    dataTypes: Class[];
    enums: Class[];
    relations: Relation[];
    classByDeclaration: Map<ClassDeclaration, Class>;
    dataTypeByDeclaration: Map<DataType, Class>;
    relationByDeclaration: Map<ElementRelation, Relation>;
}

export function contextModuleGenerateClasses(
    contextModule: ContextModule,
    packageItem: Package
): GeneratedContextModuleData {
    const returnData: GeneratedContextModuleData = {
        classes: [],
        dataTypes: [],
        enums: [],
        relations: [],
        classByDeclaration: new Map<ClassDeclaration, Class>(),
        dataTypeByDeclaration: new Map<DataType, Class>(),
        relationByDeclaration: new Map<ElementRelation, Relation>(),
    };

    contextModule.declarations.forEach((declaration) => {
        switch (declaration.$type) {
            case "ClassDeclaration": {
                const classElement = declaration as ClassDeclaration;
                // console.log(`Generating class: ${classElement.name} in ${contextModule.name}`);
                const newClass = classElementGenerator(classElement, packageItem);
                returnData.classes.push(newClass);
                returnData.classByDeclaration.set(classElement, newClass);
                break;
            }

            case "DataType": {
                const dataType = declaration as DataType;
                if (dataType.isEnum) {
                    const newEnum = enumGenerator(dataType, packageItem);
                    returnData.enums.push(newEnum);
                    returnData.dataTypes.push(newEnum);
                    returnData.dataTypeByDeclaration.set(dataType, newEnum);
                } else {
                    const newDataType = customDataTypeGenerator(dataType, packageItem);
                    returnData.dataTypes.push(newDataType);
                    returnData.dataTypeByDeclaration.set(dataType, newDataType);
                }
                break;
            }
        }
    });

    return returnData;
}

export function contextModuleGenerateRelations(
    contextModule: ContextModule,
    packageItem: Package,
    modelData: GeneratedContextModuleData,
    importedData: GeneratedContextModuleData[]
): void {
    const lookupData = [modelData, ...importedData];
    const classes: Class[] = lookupData.flatMap((data) => data.classes);
    const resolveClass = (classDeclaration: ClassDeclaration | undefined) => findGeneratedClass(lookupData, classDeclaration);

    const internalRelations = generateInternalRelations(contextModule, classes, packageItem, resolveClass);
    const externalRelations = generateExternalRelations(contextModule, classes, packageItem, resolveClass);

    [...internalRelations, ...externalRelations].forEach(({ declaration, relation }) => {
        modelData.relations.push(relation);
        modelData.relationByDeclaration.set(declaration, relation);
    });
}

export function contextModuleModularGenerator(
    contextModule: ContextModule,
    modelData: GeneratedContextModuleData,
    packageItem: Package,
    importedData: GeneratedContextModuleData[]
): void {
    const lookupData = [modelData, ...importedData];
    const classes: Class[] = lookupData.flatMap((data) => data.classes);
    const dataTypes: Class[] = lookupData.flatMap((data) => data.dataTypes);
    const relations: Relation[] = lookupData.flatMap((data) => data.relations);
    const resolveClass = (classDeclaration: ClassDeclaration | undefined) => findGeneratedClass(lookupData, classDeclaration);
    const resolveDataType = (dataType: DataType | undefined) => findGeneratedDataType(lookupData, dataType);
    const resolveRelation = (relationItem: ElementRelation | undefined) => findGeneratedRelation(lookupData, relationItem);

    generateGenSets(contextModule, classes, packageItem, resolveClass);
    generateComplexDataTypesAttributes(contextModule, dataTypes, resolveDataType);
    generateSpecializations(contextModule, classes, relations, packageItem, resolveClass, resolveRelation);
    generateClassDeclarationAttributes(contextModule, classes, dataTypes, resolveDataType, resolveClass);
    generateDataTypeSpecializations(contextModule, classes, dataTypes, packageItem, resolveClass, resolveDataType);
    generateInstantiations(contextModule, classes, relations, packageItem, resolveClass);
}

function findGeneratedClass(
    dataSets: GeneratedContextModuleData[],
    classDeclaration: ClassDeclaration | undefined
): Class | undefined {
    if (!classDeclaration) {
        return undefined;
    }

    return dataSets
        .map((data) => data.classByDeclaration.get(classDeclaration))
        .find((generatedClass) => generatedClass !== undefined);
}

function findGeneratedDataType(
    dataSets: GeneratedContextModuleData[],
    dataType: DataType | undefined
): Class | undefined {
    if (!dataType) {
        return undefined;
    }

    return dataSets
        .map((data) => data.dataTypeByDeclaration.get(dataType))
        .find((generatedDataType) => generatedDataType !== undefined);
}

function findGeneratedRelation(
    dataSets: GeneratedContextModuleData[],
    relationItem: ElementRelation | undefined
): Relation | undefined {
    if (!relationItem) {
        return undefined;
    }

    return dataSets
        .map((data) => data.relationByDeclaration.get(relationItem))
        .find((generatedRelation) => generatedRelation !== undefined);
}

function generateGenSets(
    contextModule: ContextModule,
    classes: Class[],
    packageItem: Package,
    resolveClass: (classDeclaration: ClassDeclaration | undefined) => Class | undefined
) {
    contextModule.declarations.forEach((declaration) => {
        if (declaration.$type === "GeneralizationSet") {
            const gensetData = declaration as GeneralizationSet;
            generalizationSetGenerator(gensetData, classes, packageItem, resolveClass);
        }
    });
}

function generateClassDeclarationAttributes(
    contextModule: ContextModule,
    classes: Class[],
    dataTypes: Class[],
    resolveDataType: (dataType: DataType | undefined) => Class | undefined,
    resolveClass: (classDeclaration: ClassDeclaration | undefined) => Class | undefined
): void {
    contextModule.declarations.forEach((declaration) => {
        switch (declaration.$type) {
            case "ClassDeclaration": {
                const classDeclaration = declaration as ClassDeclaration;
                const createdClass = resolveClass(classDeclaration)
                    ?? classes.find((item) => item.id === classDeclaration.name);
                if (!createdClass) {
                    throw createJsonGenerationError(`Could not generate attributes for class "${classDeclaration.name}".`, {
                        step: JSON_GENERATION_STEPS.attributeGeneration,
                        info: [
                            createJsonGenerationNodeInfo(classDeclaration, {
                                code: "missing_generated_class",
                                title: "Class was not generated",
                                description: `Class "${classDeclaration.name}" was not available in the generated OntoUML model before its attributes were processed.`,
                            }),
                        ],
                    });
                }

                attributeGenerator(classDeclaration, createdClass, dataTypes, resolveDataType);
            }
        }
    });
}

function generateExternalRelations(
    contextModule: ContextModule,
    classes: Class[],
    packageItem: Package,
    resolveClass: (classDeclaration: ClassDeclaration | undefined) => Class | undefined
): Array<{ declaration: ElementRelation; relation: Relation }> {
    const relations: Array<{ declaration: ElementRelation; relation: Relation }> = [];
    contextModule.declarations.forEach((declaration) => {
        switch (declaration.$type) {
            case "ElementRelation": {
                const elementRelation = declaration as ElementRelation;
                const createdRelation = relationGenerator(elementRelation, packageItem, classes, undefined, resolveClass);
                if (createdRelation) {
                    relations.push({
                        declaration: elementRelation,
                        relation: createdRelation,
                    });
                }
            }
        }
    });
    return relations;
}

function generateInternalRelations(
    contextModule: ContextModule,
    classes: Class[],
    packageItem: Package,
    resolveClass: (classDeclaration: ClassDeclaration | undefined) => Class | undefined
): Array<{ declaration: ElementRelation; relation: Relation }> {
    const relations: Array<{ declaration: ElementRelation; relation: Relation }> = [];
    contextModule.declarations.forEach((declaration) => {
        if (declaration.$type === "ClassDeclaration") {
            const classDeclaration = declaration as ClassDeclaration;

            classDeclaration.references.forEach((reference) => {
                const createdRelation = relationGenerator(reference, packageItem, classes, classDeclaration, resolveClass);
                if (createdRelation) {
                    relations.push({
                        declaration: reference,
                        relation: createdRelation,
                    });
                }
            });
        }
    });
    return relations;
}

function generateComplexDataTypesAttributes(
    contextModule: ContextModule,
    dataTypes: Class[],
    resolveDataType: (dataType: DataType | undefined) => Class | undefined
): void {
    contextModule.declarations.forEach((declaration) => {
        if (declaration.$type === "DataType") {
            const dataType = declaration as DataType;
            customDataTypeAttributesGenerator(dataType, dataTypes, resolveDataType);
        }
    });
}
