import { Cardinality } from "./../../language-server/generated/ast";
import {
  CardinalityValues,
  Class,
  ClassStereotype,
  Package,
  Property,
} from "ontouml-js";
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
  classElement: ClassElement | DataType,
  createdClass: Class,
  dataTypes: Class[]
): void {
  classElement.attributes.forEach((attribute) => {
    let createdAttribute: Property | undefined;
    switch (attribute.attributeType) {
      case "Date":
        const dateType = dataTypes.find(
          (item) => item.name.getText() === "Date"
        );
        if (dateType) {
          createdAttribute = createdClass.createAttribute(
            dateType,
            attribute.name
          );
        }
        break;
      case "number":
        const numberType = dataTypes.find(
          (item) => item.name.getText() === "number"
        );
        if (numberType) {
          createdAttribute = createdClass.createAttribute(
            numberType,
            attribute.name
          );
          createdAttribute.cardinality.setOneToOne();
        }
        break;

      case "boolean":
        const booleanType = dataTypes.find(
          (item) => item.name.getText() === "boolean"
        );
        if (booleanType) {
          createdAttribute = createdClass.createAttribute(
            booleanType,
            attribute.name
          );
        }
        break;

      case "string":
        const stringType = dataTypes.find(
          (item) => item.name.getText() === "string"
        );
        if (stringType) {
          createdAttribute = createdClass.createAttribute(
            stringType,
            attribute.name
          );
        }
        break;

      default:
        const customType = dataTypes.find(
          (item) => item.name.getText() === attribute.attributeType.toString()
        );
        if (customType) {
          createdAttribute = createdClass.createAttribute(
            customType,
            attribute.name
          );
        }
    }
    if (createdAttribute) {
      // Set the attribute cardinality
      setAttributeCardinality(attribute.cardinality, createdAttribute);

      // Set the attribute isOrdered meta-attribute
      createdAttribute.isOrdered = attribute.isOrdered;

      // Set the attribute isDerived meta-attribute
      createdAttribute.isDerived = !attribute.isConst;
    }
  });
}

export function setAttributeCardinality(
  cardinality: Cardinality | undefined,
  end: Property
): void {
  if (cardinality) {
    console.log("Cardinalidade", cardinality.lowerBound);
    if (cardinality.lowerBound === "*") {
      end.cardinality.setZeroToMany();
      return;
    } else if (typeof cardinality.lowerBound === "number") {
      end.cardinality.setLowerBoundFromNumber(cardinality.lowerBound);
    }
    if (cardinality.upperBound && cardinality.upperBound === "*") {
      end.cardinality.upperBound = CardinalityValues.MANY;
    } else if (
      cardinality.upperBound &&
      typeof cardinality.upperBound === "number"
    ) {
      end.cardinality.setUpperBoundFromNumber(cardinality.upperBound);
    } else if (!cardinality.upperBound) {
      end.cardinality.setCardinalityFromNumbers(
        cardinality.lowerBound,
        cardinality.lowerBound
      );
    }
  } else {
    end.cardinality.setOneToOne(); // Default Value
  }
}

export function generalizationGenerator(
  model: Package,
  sourceClass: Class,
  targetClass: Class
) {
  model.createGeneralization(sourceClass, targetClass);
}
