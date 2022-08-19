import { EnumData } from "./../../language-server/generated/ast";
import { Class, ClassStereotype, Package } from "ontouml-js";
import { ClassElement, DataType } from "../../language-server/generated/ast";

export function classElementGenerator(
  classElement: ClassElement,
  packageItem: Package
): Class {
  if (!!classElement.classElementType) {
    const stereotype = classElement.classElementType.stereotype;
    switch (stereotype) {
      case "category":
        return packageItem.createCategory(classElement.name);
      case "mixin":
        return packageItem.createMixin(classElement.name);
      case "phaseMixin":
        return packageItem.createPhaseMixin(classElement.name);
      case "roleMixin":
        return packageItem.createRoleMixin(classElement.name);
      case "historicalRoleMixin":
        return packageItem.createRoleMixin(classElement.name);
      case "event":
        return packageItem.createEvent(classElement.name);
      case "kind":
        return packageItem.createKind(classElement.name);
      case "collective":
        return packageItem.createCollective(classElement.name);
      case "quantity":
        return packageItem.createQuantity(classElement.name);
      case "quality":
        return packageItem.createQuality(classElement.name);
      case "mode":
        return packageItem.createClass(classElement.name, ClassStereotype.MODE);
      case "intrinsicMode":
        return packageItem.createIntrinsicMode(classElement.name);
      case "extrinsicMode":
        return packageItem.createExtrinsicMode(classElement.name);
      case "subkind":
        return packageItem.createSubkind(classElement.name);
      case "phase":
        return packageItem.createPhase(classElement.name);
      case "role":
        return packageItem.createRole(classElement.name);
      case "historicalRole":
        return packageItem.createHistoricalRole(classElement.name);
      case "relator":
        return packageItem.createRelator(classElement.name);
    }
  } else {
    return packageItem.createClass(classElement.name);
  }
}

export function attributeGenerator(
  classElement: ClassElement,
  createdClass: Class,
  dataTypes: Class[]
): void {
  classElement.attributes.forEach((attribute) => {
    switch (attribute.attributeType) {
      case "Date":
        const dateType = dataTypes.find(
          (item) => item.name.getText() === "Date"
        );
        if (dateType) createdClass.createAttribute(dateType, attribute.name);
        break;
      case "number":
        const numberType = dataTypes.find(
          (item) => item.name.getText() === "number"
        );
        if (numberType)
          createdClass.createAttribute(numberType, attribute.name);
        break;

      case "boolean":
        const booleanType = dataTypes.find(
          (item) => item.name.getText() === "boolean"
        );
        if (booleanType)
          createdClass.createAttribute(booleanType, attribute.name);
        break;

      case "string":
        const stringType = dataTypes.find(
          (item) => item.name.getText() === "string"
        );
        if (stringType)
          createdClass.createAttribute(stringType, attribute.name);
        break;

      default:
        const customType = dataTypes.find(
          (item) => item.name.getText() === attribute.attributeType.toString()
        );
        if (customType)
          createdClass.createAttribute(customType, attribute.name);
    }
  });
}

export function generalizationGenerator(
  model: Package,
  sourceClass: Class,
  targetClass: Class
) {
  model.createGeneralization(sourceClass, targetClass);
}

export function customDataTypeGenerator(
  dataType: DataType,
  model: Package,
  dataTypes: Class[]
) {
  model.createDatatype(dataType.name);
  console.log(dataType.name);
  // dataType.properties.forEach((element) => {
  //   // const;
  // });
}

export function enumGenerator(enumData: EnumData, model: Package) {
  const createdEnum = model.createEnumeration();
  // enumData.elements.forEach((element) => {
  //   createdEnum.createLiteral(element.name);
  // });
}
