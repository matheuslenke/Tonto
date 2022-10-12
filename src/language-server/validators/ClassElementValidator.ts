import { ClassElement } from "./../generated/ast";
import { ValidationAcceptor } from "langium";
import { EndurantTypes } from "../models/EndurantType";
import { checkCircularSpecializationRecursive } from "../utils/CheckCircularSpecializationRecursive";
import { checkSortalSpecializesUniqueUltimateSortalRecursive } from "../utils/CheckSortalSpecializesUniqueUltimateSortalRecursive";
import { checkUltimateSortalSpecializesUltimateSortalRecursive } from "../utils/CheckUltimateSortalSpecializesUltimateSortalRecursive";

export class ClassElementValidator {
  /*
   * Checks if a Kind specializes a unique ultimate sortal (Kind, Collective, Quantity, Relator, Quality or mode)
   */
  checkSortalSpecializeUniqueUltimateSortal(
    classElement: ClassElement,
    accept: ValidationAcceptor
  ): void {
    if (!classElement || !classElement.classElementType) {
      return;
    }
    const endurantType = classElement.classElementType.stereotype;

    if (endurantType === null || endurantType === undefined) {
      return;
    }
    // Check if it is an Sortal
    if (
      endurantType === EndurantTypes.KIND ||
      endurantType === EndurantTypes.SUBKIND ||
      endurantType === EndurantTypes.PHASE ||
      endurantType === EndurantTypes.ROLE ||
      endurantType === EndurantTypes.QUALITY ||
      endurantType === EndurantTypes.QUANTITY ||
      endurantType === EndurantTypes.RELATOR ||
      endurantType === EndurantTypes.MODE ||
      endurantType === EndurantTypes.INTRINSIC_MODE ||
      endurantType === EndurantTypes.EXTRINSIC_MODE ||
      endurantType === EndurantTypes.COLLECTIVE
    ) {
      checkSortalSpecializesUniqueUltimateSortalRecursive(
        classElement,
        [],
        0,
        accept
      );
    }
  }

  checkUltimateSortalSpecializeUltimateSortal(
    classElement: ClassElement,
    accept: ValidationAcceptor
  ): void {
    if (!classElement || !classElement.classElementType) {
      return;
    }
    const endurantType = classElement.classElementType.stereotype;

    if (endurantType === null || endurantType === undefined) {
      return;
    }
    // Check if it is an UltimateSortal
    // 'kind' | 'collective' | 'quantity' | 'quality' | 'mode' | 'intrinsicMode' | 'extrinsicMode' | 'relator'
    if (
      endurantType === EndurantTypes.KIND ||
      endurantType === EndurantTypes.COLLECTIVE ||
      endurantType === EndurantTypes.QUANTITY ||
      endurantType === EndurantTypes.QUALITY ||
      endurantType === EndurantTypes.RELATOR ||
      endurantType === EndurantTypes.MODE ||
      endurantType === EndurantTypes.INTRINSIC_MODE ||
      endurantType === EndurantTypes.EXTRINSIC_MODE
    ) {
      checkUltimateSortalSpecializesUltimateSortalRecursive(
        classElement,
        accept
      );
    }
  }

  checkClassElementStartsWithCapital(
    classElement: ClassElement,
    accept: ValidationAcceptor
  ): void {
    if (classElement.name) {
      const firstChar = classElement.name.substring(0, 1);
      if (firstChar.toUpperCase() !== firstChar) {
        accept("warning", "Class name should start with a capital.", {
          node: classElement,
          property: "name",
        });
      }
    }
  }

  /*
   * Checks if a Rigid stereotype specializes a anti-rigid stereotype
   */
  checkRigidSpecializesAntiRigid(
    classElement: ClassElement,
    accept: ValidationAcceptor
  ): void {
    if (!classElement || !classElement.classElementType) {
      return;
    }
    const endurantType = classElement.classElementType.stereotype;

    if (endurantType === null || endurantType === undefined) {
      return;
    }

    // Check if it is a rigid stereotype
    if (
      endurantType === EndurantTypes.KIND ||
      endurantType === EndurantTypes.SUBKIND ||
      endurantType === EndurantTypes.COLLECTIVE ||
      endurantType === EndurantTypes.CATEGORY
    ) {
      classElement.specializationEndurants.forEach((specializationItem) => {
        const refElement = specializationItem.ref?.$cstNode
          ?.element as ClassElement;
        if (!refElement || !refElement.classElementType) {
          return;
        }
        const refType = refElement.classElementType.stereotype;

        if (
          refType === EndurantTypes.PHASE ||
          refType === EndurantTypes.ROLE ||
          refType === EndurantTypes.PHASE_MIXIN ||
          refType === EndurantTypes.ROLE_MIXIN
        ) {
          // console.log("Error na referencia")
          accept(
            "warning",
            `Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class ${classElement.name} cannot specialize the anti-rigid class ${refElement.name}`,
            { node: classElement }
          );
        }
      });
    }
  }

  checkDuplicatedReferenceNames(
    classElement: ClassElement,
    accept: ValidationAcceptor
  ): void {
    const references = classElement.references;

    let names: string[] = [];

    references.forEach((reference) => {
      const nameExists = names.find((name) => name === reference.name);
      if (nameExists) {
        accept("error", "Duplicated reference name", { node: reference });
      } else {
        if (reference.name) {
          names.push(reference.name);
        }
      }
    });
  }

  /*
   * The element specializations must have ontological natures that are contained in the ontological natures of its superclasses
   */
  checkCompatibleNatures(
    classElement: ClassElement,
    accept: ValidationAcceptor
  ): void {
    const elementNatures = classElement.ontologicalNatures;

    if (elementNatures) {
      elementNatures.natures.forEach((nature) => {
        let specializationDoesntExistsInParent = true;
        classElement.specializationEndurants.forEach(
          (specializationEndurant) => {
            let specializationNatures =
              specializationEndurant.ref?.ontologicalNatures;
            const natureExists = specializationNatures?.natures.find(
              (specializationNature) => {
                return specializationNature === nature;
              }
            );
            if (!natureExists) {
              specializationDoesntExistsInParent = false;
            }
          }
        );

        if (!specializationDoesntExistsInParent) {
          accept(
            "error",
            "This element cannot be restricted to Natures that its superclass is not restricted",
            { node: classElement, property: "ontologicalNatures" }
          );
        }
      });
    }
  }

  checkNaturesOnlyOnNonSortals(
    classElement: ClassElement,
    accept: ValidationAcceptor
  ): void {
    const ElementNatures = classElement.ontologicalNatures;
    if (ElementNatures) {
      if (
        classElement.classElementType?.stereotype !== "roleMixin" &&
        classElement.classElementType?.stereotype !== "category" &&
        classElement.classElementType?.stereotype !== "phaseMixin" &&
        classElement.classElementType?.stereotype !== "mixin"
      ) {
        accept("error", "Only non-sortal types can specialize natures", {
          node: classElement,
          property: "ontologicalNatures",
        });
      }
    }
  }

  /*
   * Checks if an Element has a ciclic specialization
   */
  checkCircularSpecialization(
    classElement: ClassElement,
    accept: ValidationAcceptor
  ): void {
    classElement.specializationEndurants.forEach((specializationItem) => {
      const specItem = specializationItem.ref;
      if (!specItem) {
        return;
      }
      checkCircularSpecializationRecursive(specItem, [], accept);
    });
  }
}
