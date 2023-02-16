import { ErrorMessages } from "./../models/ErrorMessages";
import { ValidationAcceptor } from "langium";
import { ClassDeclaration } from "../generated/ast";
import { OntologicalCategoryEnum } from "../models/OntologicalCategory";

const checkUltimateSortalSpecializesUltimateSortalRecursive = (
  actualElement: ClassDeclaration,
  accept: ValidationAcceptor
): void => {
  actualElement.specializationEndurants.forEach((specializationItem) => {
    const specItem = specializationItem.ref;
    if (!specItem) {
      return;
    }

    const refOntologicalCategory =
      specItem.classElementType?.ontologicalCategory;

    if (
      refOntologicalCategory === OntologicalCategoryEnum.KIND ||
      refOntologicalCategory === OntologicalCategoryEnum.COLLECTIVE ||
      refOntologicalCategory === OntologicalCategoryEnum.QUANTITY ||
      refOntologicalCategory === OntologicalCategoryEnum.QUALITY ||
      refOntologicalCategory === OntologicalCategoryEnum.RELATOR ||
      refOntologicalCategory === OntologicalCategoryEnum.MODE ||
      refOntologicalCategory === OntologicalCategoryEnum.INTRINSIC_MODE ||
      refOntologicalCategory === OntologicalCategoryEnum.EXTRINSIC_MODE
    ) {
      accept("error", ErrorMessages.ultimateSortalSpecializesUltimateSortal, {
        node: actualElement,
      });
      return;
    } else {
      checkUltimateSortalSpecializesUltimateSortalRecursive(specItem, accept);
    }
  });
};

export { checkUltimateSortalSpecializesUltimateSortalRecursive };
