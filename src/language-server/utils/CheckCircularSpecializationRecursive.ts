import { ErrorMessages } from "./../models/ErrorMessages";
import { ValidationAcceptor } from "langium";
import { ClassDeclaration, GeneralizationSet } from "../generated/ast";

const checkCircularSpecializationRecursive = (
  actualElement: ClassDeclaration,
  verificationList: ClassDeclaration[],
  accept: ValidationAcceptor
): void => {
  actualElement.specializationEndurants.forEach((specializationItem) => {
    const specItem = specializationItem.ref;
    if (!specItem) {
      return;
    }
    const specializationExists = verificationList.find(
      (item) => item.name === specItem.name
    );

    if (specializationExists) {
      accept("error", ErrorMessages.cyclicSpecialization, {
        node: actualElement,
        property: "specializationEndurants",
      });
      accept("error", ErrorMessages.cyclicSpecialization, {
        node: specItem,
        property: "name",
      });
      return;
    }
    const newVerificationList = [...verificationList, actualElement];
    checkCircularSpecializationRecursive(specItem, newVerificationList, accept);
  });
};

const checkCircularSpecializationRecursiveWithGenset = (
  actualElement: ClassDeclaration | GeneralizationSet,
  verificationList: ClassDeclaration[],
  genSets: GeneralizationSet[],
  accept: ValidationAcceptor
): void => {
  /**
   * If the element is a ClassDeclaration, then we need to check its specialization items. And we need
   * also to check all generalization sets where this class is the specific
   */

  if (actualElement.$type === "ClassDeclaration") {
    const newVerificationList = [...verificationList, actualElement];
    actualElement.specializationEndurants.forEach((specializationItem) => {
      const specItem = specializationItem.ref;
      if (!specItem) {
        return;
      }

      const specializationExists = verificationList.find(
        (item) => item.name === specItem.name
      );

      if (specializationExists) {
        accept("error", ErrorMessages.cyclicSpecialization, {
          node: actualElement,
          property: "specializationEndurants",
        });
        accept("error", ErrorMessages.cyclicSpecialization, {
          node: specItem,
          property: "name",
        });
        return;
      }
      checkCircularSpecializationRecursiveWithGenset(
        specItem,
        newVerificationList,
        genSets,
        accept
      );
      // Now, we need to check all the generalizationSets where actualElement is a specific
      // Get the genSets where the element is the specific
      const genSetsWithElement: GeneralizationSet[] = getGensetsWhereSpecific(
        specItem.name,
        genSets
      );

      genSetsWithElement.forEach((genSet) => {
        checkCircularSpecializationRecursiveWithGenset(
          genSet,
          newVerificationList,
          genSets,
          accept
        );
      });
    });
  } else if (actualElement.$type === "GeneralizationSet") {
    /**
     * If the element is a GeneralizationSet, then we need to check the general element and go up from there
     */
    const generalItem = actualElement.generalItem.ref;
    if (!generalItem) {
      return;
    }
    const specializationExists = verificationList.find(
      (item) => item.name === generalItem.name
    );
    if (specializationExists) {
      accept("error", ErrorMessages.cyclicSpecialization, {
        node: actualElement,
        property: "generalItem",
      });
      accept("error", ErrorMessages.cyclicSpecialization, {
        node: generalItem,
        property: "name",
      });
      return;
    }

    const genSetsWhereElementIsSpecific = getGensetsWhereSpecific(
      generalItem.name ?? "",
      genSets
    );

    const specificItems = actualElement.specificItems
      .map((item) => item.ref)
      .filter(
        (item) => item !== undefined && item !== null
      ) as ClassDeclaration[];
    const newVerificationList = [...verificationList, ...specificItems];

    genSetsWhereElementIsSpecific.forEach((genSet) => {
      checkCircularSpecializationRecursiveWithGenset(
        genSet,
        newVerificationList,
        genSets,
        accept
      );
    });
  }
};

function getGensetsWhereSpecific(
  declaration: string,
  genSets: GeneralizationSet[]
): GeneralizationSet[] {
  return genSets.filter((genSet) => {
    const specificItem = genSet.specificItems.find(
      (specific) => specific.ref?.name === declaration
    );
    return specificItem ?? undefined;
  });
}

export {
  checkCircularSpecializationRecursive,
  checkCircularSpecializationRecursiveWithGenset,
};
