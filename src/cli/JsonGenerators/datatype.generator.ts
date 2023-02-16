import { Class, Package, Property } from "ontouml-js";
import { ComplexDataType } from "../../language-server/generated/ast";
import { setAttributeCardinality } from "./class.generator";

export function customDataTypeGenerator(
  dataType: ComplexDataType,
  model: Package,
  dataTypes: Class[]
): Class {
  const dataTypeClass = model.createDatatype(dataType.name);

  dataType.attributes.forEach(element => {
    let createdAttribute: Property | undefined;

    if (element.attributeType) {
      switch (element.attributeType) {
      case "date": {
        const dateType = dataTypes.find(
          item => item.name.getText() === "Date"
        );
        if (dateType) {
          createdAttribute = dataTypeClass.createAttribute(
            dateType,
            element.name
          );
        }
        break;
      }
      case "number": {
        const numberType = dataTypes.find(
          item => item.name.getText() === "number"
        );
        if (numberType) {
          createdAttribute = dataTypeClass.createAttribute(
            numberType,
            element.name
          );
        }
        break;
      }

      case "boolean": {
        const booleanType = dataTypes.find(
          item => item.name.getText() === "boolean"
        );
        if (booleanType) {
          createdAttribute = dataTypeClass.createAttribute(
            booleanType,
            element.name
          );
        }
        break;
      }

      case "string": {
        const stringType = dataTypes.find(
          item => item.name.getText() === "string"
        );
        if (stringType) {
          createdAttribute = dataTypeClass.createAttribute(
            stringType,
            element.name
          );
        }
        break;
      }
      }
    } else if (element.attributeTypeRef !== undefined) {
      const customType = dataTypes.find(
        item =>
          item.name.getText() === element.attributeType?.toString()
      );
      if (customType) {
        createdAttribute = dataTypeClass.createAttribute(
          customType,
          element.name
        );
      }
    }

    if (createdAttribute) {
      // Set the attribute cardinality
      setAttributeCardinality(element.cardinality, createdAttribute);

      // Set the attribute isOrdered meta-attribute
      createdAttribute.isOrdered = element.isOrdered;

      // Set the attribute isDerived meta-attribute
      createdAttribute.isDerived = !element.isConst;
    }
  });
  return dataTypeClass;
}
