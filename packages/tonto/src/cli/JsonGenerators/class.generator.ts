import { Class, ClassStereotype, OntologicalNature, Package } from "ontouml-js";
import { ClassDeclaration, OntologicalNature as Nature } from "../../language-server/generated/ast";
import {
  isBaseSortalOntoCategory,
  isNonSortalOntoCategory,
  isUltimateSortalOntoCategory,
} from "../../language-server/models/OntologicalCategory";
import { getParentNatures } from "../../language-server/utils/getParentNatures";
import { tontoNatureUtils } from "../../language-server/models/Natures";

export function classElementGenerator(classElement: ClassDeclaration, packageItem: Package): Class {
  if (classElement.classElementType) {
    const stereotype = classElement.classElementType.ontologicalCategory;
    let natures: OntologicalNature[] | undefined = [];
    let firstNature: OntologicalNature | undefined;
    natures = getOntoUMLNatures(classElement, classElement.ontologicalNatures?.natures ?? []);
    if (natures && natures.length > 0) {
      firstNature = natures[0];
    }
    switch (stereotype) {
      /**
       * Non sortals
       */
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
      /**
       * Non Endurants
       */
      case "event": {
        return packageItem.createEvent(classElement.name);
      }
      case "situation": {
        return packageItem.createSituation(classElement.name);
      }
      /**
       * Ultimate Sortals
       */
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
        return packageItem.createClass(classElement.name, ClassStereotype.MODE, natures);
      }
      case "intrinsicMode": {
        return packageItem.createIntrinsicMode(classElement.name);
      }
      case "extrinsicMode": {
        return packageItem.createExtrinsicMode(classElement.name);
      }

      /**
       * Base Sortals
       */
      case "subkind": {
        const subkind = packageItem.createSubkind(classElement.name, firstNature);
        if (!firstNature) {
          subkind.restrictedTo = [];
        }
        return subkind;
      }
      case "phase": {
        const phase = packageItem.createPhase(classElement.name, firstNature);
        if (!firstNature) {
          phase.restrictedTo = [];
        }
        return phase;
      }
      case "role": {
        const role = packageItem.createRole(classElement.name, firstNature);
        if (!firstNature) {
          role.restrictedTo = [];
        }
        return role;
      }
      case "historicalRole": {
        if (firstNature) {
          return packageItem.createHistoricalRole(classElement.name, { restrictedTo: [firstNature] });
        } else {
          const historicalRole = packageItem.createHistoricalRole(classElement.name);
          historicalRole.restrictedTo = [];
          return historicalRole;
        }
      }
      case "relator": {
        return packageItem.createRelator(classElement.name);
      }
      case "type": {
        return packageItem.createType(classElement.name);
      }
      case "powertype": {
        const powerType = packageItem.createType(classElement.name);
        powerType.isPowertype = true;
        return powerType;
      }
      /**
       * Undefined stereotype
       */
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

export function generalizationGenerator(model: Package, sourceClass: Class, targetClass: Class) {
  model.createGeneralization(sourceClass, targetClass);
}

export function createInstantiation(_model: Package, _sourceClass: Class, _targetClass: Class) {
  // TODO: Waiting for ontouml-js to implement instantiation
  // model.createInstantiationRelation(sourceClass, targetClass);
}

function getOntoUMLNatures(classDeclaration: ClassDeclaration, natures: Nature[]): OntologicalNature[] | undefined {
  /**
   * If it is an UltimateSortal, it already has its own nature
   */
  if (isUltimateSortalOntoCategory(classDeclaration.classElementType.ontologicalCategory)) {
    const nature = tontoNatureUtils.getNatureFromUltimateSortal(classDeclaration);
    if (classDeclaration.classElementType.ontologicalCategory === "mode") {
      console.log(nature);
    }
    if (nature) {
      return [nature];
    }
    /**
     * If it is an BaseSortal, it can have a defined nature from it's parents or a declared one
     */
  } else if (isBaseSortalOntoCategory(classDeclaration.classElementType.ontologicalCategory)) {
    const parentNatures = getParentNatures(classDeclaration, [], []);
    if (natures.length > 0) {
      const specifiedNatures = natures.flatMap((nature) => {
        return tontoNatureUtils.getNatureFromAst(nature);
      });
      return [...parentNatures, ...specifiedNatures];
    }
    if (parentNatures.length > 0) {
      return parentNatures;
    }
    return undefined;
    /**
     * If it is a Non Sortal, it can have functional-complexes by default, a declared one or based on its supertypes
     */
  } else if (isNonSortalOntoCategory(classDeclaration.classElementType.ontologicalCategory)) {
    if (natures.length > 0) {
      return natures.flatMap((nature) => {
        return tontoNatureUtils.getNatureFromAst(nature);
      });
    } else {
      tontoNatureUtils.getDefaultNatureFromNonSortal(classDeclaration);
    }
  }
  return undefined;
}
