import {
  Class,
  ClassStereotype,
  OntologicalNature,
  Package,
  Property,
} from "ontouml-js";
import {
  Attribute,
  ClassDeclaration,
  DataType,
  OntologicalNature as Nature,
} from "../../language-server/generated/ast";
import { OntologicalCategoryEnum } from "../../language-server/models/OntologicalCategory";
import { setPropertyCardinality } from "./cardinality.generator";

export function classElementGenerator(
  classElement: ClassDeclaration,
  packageItem: Package
): Class {
  if (classElement.classElementType) {
    const stereotype = classElement.classElementType.ontologicalCategory;
    let natures: OntologicalNature[] = [];
    if (classElement.ontologicalNatures) {
      natures = getOntoUMLNatures(classElement.ontologicalNatures.natures);
    } else {
      natures = getDefaultOntoUMLNature(classElement);
    }
    switch (stereotype) {
      case "category": {
        return packageItem.createCategory(classElement.name, natures);
      }
      case "mixin": {
        return packageItem.createMixin(classElement.name, natures);
      }
      case "phaseMixin": {
        return packageItem.createPhaseMixin(classElement.name, natures);
      }
      case "roleMixin": {
        return packageItem.createRoleMixin(classElement.name, natures);
      }
      case "historicalRoleMixin": {
        return packageItem.createRoleMixin(classElement.name, natures);
      }
      case "event": {
        return packageItem.createEvent(classElement.name);
      }
      case "kind": {
        return packageItem.createKind(classElement.name);
      }
      case "collective": {
        return packageItem.createCollective(classElement.name);
      }
      case "quantity": {
        return packageItem.createQuantity(classElement.name);
      }
      case "quality": {
        return packageItem.createQuality(classElement.name);
      }
      case "mode": {
        return packageItem.createClass(
          classElement.name,
          ClassStereotype.MODE,
          [OntologicalNature.extrinsic_mode, OntologicalNature.intrinsic_mode]
        );
      }
      case "intrinsicMode": {
        return packageItem.createIntrinsicMode(classElement.name);
      }
      case "extrinsicMode": {
        return packageItem.createExtrinsicMode(classElement.name);
      }
      case "subkind": {
        return packageItem.createSubkind(classElement.name);
      }
      case "phase": {
        return packageItem.createPhase(classElement.name);
      }
      case "role": {
        return packageItem.createRole(classElement.name, natures[0]);
      }
      case "historicalRole": {
        return packageItem.createHistoricalRole(classElement.name);
      }
      case "relator": {
        return packageItem.createRelator(classElement.name);
      }
      case "type": {
        return packageItem.createType(classElement.name);
      }
      case "situation": {
        return packageItem.createSituation(classElement.name);
      }
      case "class": {
        if (classElement.ontologicalNatures?.natures.includes("abstract-individuals")) {
          return packageItem.createAbstract(classElement.name, { stereotype: ClassStereotype.ABSTRACT });
        }
        return packageItem.createClass(classElement.name, undefined, natures);
      }
    }
  }
  return packageItem.createClass(classElement.name);
}

export function attributeGenerator(
  classElement: ClassDeclaration | DataType,
  createdClass: Class,
  dataTypes: Class[]
): void {
  classElement.attributes.forEach((attribute: Attribute) => {
    let createdAttribute: Property | undefined;
    if (attribute.attributeTypeRef) {
      const customType = dataTypes.find(
        (item) => item.name.getText() === attribute.attributeTypeRef.ref?.name
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
      setPropertyCardinality(attribute.cardinality, createdAttribute);

      createdAttribute.isOrdered = attribute.isOrdered;
      createdAttribute.isDerived = attribute.isDerived;
      createdAttribute.isReadOnly = attribute.isConst;
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

export function createInstantiation(
  _model: Package,
  _sourceClass: Class,
  _targetClass: Class
) {
  // TODO: Waiting for ontouml-js to implement instantiation
  // model.createInstantiationRelation(sourceClass, targetClass);
}

function getOntoUMLNatures(natures: Nature[]): OntologicalNature[] {
  return natures.flatMap((nature) => {
    switch (nature) {
      case "collectives":
        return OntologicalNature.collective;
      case "extrinsic-modes":
        return OntologicalNature.extrinsic_mode;
      case "functional-complexes":
        return OntologicalNature.functional_complex;
      case "intrinsic-modes":
        return OntologicalNature.intrinsic_mode;
      case "qualities":
        return OntologicalNature.quality;
      case "quantities":
        return OntologicalNature.quantity;
      case "relators":
        return OntologicalNature.relator;
      case "types":
        return OntologicalNature.type;
      case "objects":
        return [
          OntologicalNature.functional_complex,
          OntologicalNature.collective,
          OntologicalNature.quantity,
        ];
      default:
        return [];
    }
  });
}

function getDefaultOntoUMLNature(
  element: ClassDeclaration
): OntologicalNature[] {
  if (
    element.classElementType?.ontologicalCategory ===
    OntologicalCategoryEnum.CATEGORY ||
    element.classElementType?.ontologicalCategory ===
    OntologicalCategoryEnum.MIXIN ||
    element.classElementType?.ontologicalCategory ===
    OntologicalCategoryEnum.PHASE_MIXIN ||
    element.classElementType?.ontologicalCategory ===
    OntologicalCategoryEnum.ROLE_MIXIN ||
    element.classElementType?.ontologicalCategory ===
    OntologicalCategoryEnum.HISTORICAL_ROLE_MIXIN ||
    element.classElementType?.ontologicalCategory ===
    OntologicalCategoryEnum.EVENT ||
    element.classElementType?.ontologicalCategory ===
    OntologicalCategoryEnum.SITUATION
  ) {
    return [OntologicalNature.functional_complex];
  } else if (element.classElementType.ontologicalCategory === "class") {
    return Object.values(OntologicalNature);
  } else {
    return [];
  }
}
