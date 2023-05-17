import { Class, Package, Relation } from "ontouml-js";
import { ClassDeclaration, ComplexDataType, ContextModule, ElementRelation, Enum, GeneralizationSet } from "../../language-server/generated/ast";
import { attributeGenerator, classElementGenerator } from "../JsonGenerators/class.generator";
import { customDataTypeGenerator } from "../JsonGenerators/datatype.generator";
import { enumGenerator } from "../JsonGenerators/enum.generator";
import { generalizationSetGenerator } from "../JsonGenerators/genset.generator";
import { generateInstantiations } from "../JsonGenerators/instantiation.generator";
import { relationGenerator } from "../JsonGenerators/relation.generator";
import { generateSpecializations } from "../JsonGenerators/specialization.generator";

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
    relations: []
  };

  contextModule.declarations.forEach((declaration) => {
    switch (declaration.$type) {
      case "ClassDeclaration": {
        const classElement = declaration as ClassDeclaration;
        const newClass = classElementGenerator(classElement, packageItem);
        attributeGenerator(classElement, newClass, returnData.dataTypes);
        returnData.classes.push(newClass);
        break;
      }

      case "ComplexDataType": {
        const dataType = declaration as ComplexDataType;
        const newDataType = customDataTypeGenerator(
          dataType,
          packageItem,
          returnData.dataTypes
        );
        attributeGenerator(dataType, newDataType, returnData.dataTypes);
        break;
      }

      case "Enum": {
        const enumData = declaration as Enum;
        enumGenerator(enumData, packageItem);
        break;
      }
    }
  });
  return returnData;
}

export function contextModuleModularGenerator(
  contextModule: ContextModule,
  modelData: GeneratedContextModuleData,
  packageItem: Package,
  importedData: GeneratedContextModuleData[]
): void {
  const classes: Class[] = [...modelData.classes];
  const dataTypes: Class[] = [...modelData.dataTypes];
  const relations: Relation[] = [];

  // Adding classes from imports
  importedData.forEach((data) => {
    classes.push(...data.classes);
  });

  // Adding dataTypes from imports
  dataTypes.push(...importedData.flatMap((data) => data.dataTypes));

  generateGenSets(contextModule, classes, packageItem);

  // Generate all relations first, without looking for specializations

  generateInternalRelations(contextModule, classes, relations, packageItem);
  generateExternalRelations(contextModule, classes, relations, packageItem);
  generateSpecializations(contextModule, classes, relations, packageItem);
  generateInstantiations(contextModule, classes, relations, packageItem);
}

function generateGenSets(
  contextModule: ContextModule,
  classes: Class[],
  packageItem: Package
) {
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
  packageItem: Package,
): void {
  contextModule.declarations.forEach((declaration) => {
    switch (declaration.$type) {
      case "ElementRelation": {
        const elementRelation = declaration as ElementRelation;
        const createdRelation = relationGenerator(
          elementRelation,
          packageItem,
          classes
        );
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
        const createdRelation = relationGenerator(
          reference,
          packageItem,
          classes,
          classDeclaration
        );
        if (createdRelation) {
          relations.push(createdRelation);
        }
      });
    }
  });
}
