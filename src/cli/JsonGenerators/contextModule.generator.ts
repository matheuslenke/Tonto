import { Class, Package, Relation } from "ontouml-js";
import { ClassDeclaration, ComplexDataType, ContextModule, ElementRelation, Enum, GeneralizationSet } from "../../language-server/generated/ast";
import { attributeGenerator, classElementGenerator } from "./class.generator";
import { customDataTypeGenerator } from "./datatype.generator";
import { enumGenerator } from "./enum.generator";
import { generalizationSetGenerator } from "./genset.generator";
import { generateInstantiations } from "./instantiation.generator";
import { relationGenerator } from "./relation.generator";
import { generateSpecializations } from "./specialization.generator";

export function contextModuleGenerator(
  contextModule: ContextModule,
  packageItem: Package
): void {
  const classes: Class[] = [];
  const dataTypes: Class[] = createBaseDatatypes(packageItem);
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

    case "ComplexDataType": {
      const dataType = declaration as ComplexDataType;
      const newDataType = customDataTypeGenerator(
        dataType,
        packageItem,
        dataTypes
      );
      attributeGenerator(dataType, newDataType, dataTypes);
      break;
    }

    case "Enum": {
      const enumData = declaration as Enum;
      enumGenerator(enumData, packageItem);
      break;
    }
    }
  });

  generateGenSets(contextModule, classes, packageItem);
  generateInternalRelations(contextModule, classes, relations, packageItem);
  generateExternalRelations(contextModule, classes, relations, packageItem);
  generateSpecializations(contextModule, classes, relations, packageItem);
  generateInstantiations(contextModule, classes, relations, packageItem);
}

function createBaseDatatypes(model: Package): Class[] {
  const data = model.createDatatype("Date");
  const string = model.createDatatype("string");
  const number = model.createDatatype("number");
  const boolean = model.createDatatype("boolean");

  return [data, string, number, boolean];
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
  packageItem: Package
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
