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

export interface GeneratedContextModuleData {
  classes: Class[];
  dataTypes: Class[];
  enums: Class[];
  relations: Relation[];
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
  };

  contextModule.declarations.forEach((declaration) => {
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

export function contextModuleGenerateRelations(
  contextModule: ContextModule,
  packageItem: Package,
  modelData: GeneratedContextModuleData,
  importedData: GeneratedContextModuleData[]
): void {
  const classes: Class[] = [...modelData.classes];
  classes.push(...importedData.flatMap((data) => data.classes));

  const internalRelations = generateInternalRelations(contextModule, classes, packageItem);
  const externalRelations = generateExternalRelations(contextModule, classes, packageItem);
  modelData.relations.push(...internalRelations, ...externalRelations);
}

export function contextModuleModularGenerator(
  contextModule: ContextModule,
  modelData: GeneratedContextModuleData,
  packageItem: Package,
  importedData: GeneratedContextModuleData[]
): void {
  const classes: Class[] = [...modelData.classes];
  const dataTypes: Class[] = [...modelData.dataTypes];
  const relations: Relation[] = [...modelData.relations];

  // Adding Elements from imports
  classes.push(...importedData.flatMap((data) => data.classes));
  dataTypes.push(...importedData.flatMap((data) => data.dataTypes));
  relations.push(...importedData.flatMap((data) => data.relations));

  generateGenSets(contextModule, classes, packageItem);
  generateComplexDataTypesAttributes(contextModule, dataTypes);
  generateSpecializations(contextModule, classes, relations, packageItem);
  generateClassDeclarationAttributes(contextModule, classes, dataTypes);
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

function generateClassDeclarationAttributes(contextModule: ContextModule, classes: Class[], dataTypes: Class[]): void {
  contextModule.declarations.forEach((declaration) => {
    switch (declaration.$type) {
    case "ClassDeclaration": {
      const classDeclaration = declaration as ClassDeclaration;
      const createdClass = classes.find((item) => item.getName() === classDeclaration.name);
      if (createdClass) {
        attributeGenerator(classDeclaration, createdClass, dataTypes);
      }
    }
    }
  });
}

function generateExternalRelations(contextModule: ContextModule, classes: Class[], packageItem: Package): Relation[] {
  const relations: Relation[] = [];
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
  return relations;
}

function generateInternalRelations(contextModule: ContextModule, classes: Class[], packageItem: Package): Relation[] {
  const relations: Relation[] = [];
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
  return relations;
}

function generateComplexDataTypesAttributes(contextModule: ContextModule, dataTypes: Class[]): void {
  contextModule.declarations.forEach((declaration) => {
    if (declaration.$type === "DataType") {
      const dataType = declaration as DataType;
      customDataTypeAttributesGenerator(dataType, dataTypes);
    }
  });
}
