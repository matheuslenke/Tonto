import { GeneralizationSet } from "../../language-server/generated/ast";
import {
  ContextModule,
  ClassElement,
  DataType,
  EnumData,
  ElementRelation,
} from "../../language-server/generated/ast";
import { Package, Class, Relation } from "ontouml-js";
import { attributeGenerator, classElementGenerator } from "./class.generator";
import { relationGenerator } from "./relation.generator";
import { generateSpecializations } from "./specialization.generator";
import { enumGenerator } from "./enum.generator";
import { customDataTypeGenerator } from "./datatype.generator";
import { generalizationSetGenerator } from "./genset.generator";
import { generateInstantiations } from "./instantiation.generator";

export function contextModuleGenerator(
  contextModule: ContextModule,
  packageItem: Package
): void {
  let classes: Class[] = [];
  let dataTypes: Class[] = createBaseDatatypes(packageItem);
  let relations: Relation[] = [];
  // Creating base datatypes

  contextModule.elements.forEach((element) => {
    switch (element.$type) {
      case "ClassElement":
        const classElement = element as ClassElement;
        const newClass = classElementGenerator(classElement, packageItem);
        attributeGenerator(classElement, newClass, dataTypes);
        classes.push(newClass);
        break;

      case "DataType":
        const dataType = element as DataType;
        const newDataType = customDataTypeGenerator(
          dataType,
          packageItem,
          dataTypes
        );
        attributeGenerator(dataType, newDataType, dataTypes);
        break;

      case "EnumData":
        const enumData = element as EnumData;
        enumGenerator(enumData, packageItem);
        break;
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
  contextModule.elements.forEach((element) => {
    if (element.$type === "GeneralizationSet") {
      const gensetData = element as GeneralizationSet;
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
  contextModule.elements.forEach((element) => {
    switch (element.$type) {
      case "ElementRelation":
        const elementRelation = element as ElementRelation;
        const createdRelation = relationGenerator(
          elementRelation,
          packageItem,
          classes
        );
        if (createdRelation) {
          relations.push(createdRelation);
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
  contextModule.elements.forEach((element) => {
    if (element.$type === "ClassElement") {
      const classElement = element as ClassElement;

      classElement.references.forEach((reference) => {
        const createdRelation = relationGenerator(
          reference,
          packageItem,
          classes,
          classElement
        );
        if (createdRelation) {
          relations.push(createdRelation);
        }
      });
    }
  });
}
