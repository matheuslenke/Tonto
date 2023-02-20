import { ErrorMessages } from "./../models/ErrorMessages";
import { ValidationAcceptor } from "langium";
import { ClassDeclaration } from "../generated/ast";
import { isUltimateSortalOntoCategory } from "../models/OntologicalCategory";

const validateSortalSpecializesUniqueUltimateSortalRecursive = (
  actualElement: ClassDeclaration,
  totalUltimateSortalSpecialized: number,
  accept: ValidationAcceptor
): void => {
  const totalUltimateSortalSpecializations =
    checkSortalSpecializesUniqueUltimateSortalRecursive(
      actualElement,
      totalUltimateSortalSpecialized
    );
  if (totalUltimateSortalSpecializations > 1) {
    accept("error", ErrorMessages.sortalSpecializesUniqueUltimateSortal, {
      node: actualElement,
      property: "name",
    });
  }
};

const checkSortalSpecializesUniqueUltimateSortalRecursive = (
  actualElement: ClassDeclaration,
  totalUltimateSortalSpecialized: number
): number => {
  if (totalUltimateSortalSpecialized >= 2) {
    return totalUltimateSortalSpecialized;
  }
  actualElement.specializationEndurants.forEach((specializationItem) => {
    const specItem = specializationItem.ref;
    if (specItem) {
      const specCategory = specItem.classElementType?.ontologicalCategory;
      if (isUltimateSortalOntoCategory(specCategory)) {
        totalUltimateSortalSpecialized += 1;
      }
      totalUltimateSortalSpecialized = checkSortalSpecializesUniqueUltimateSortalRecursive(
        specItem,
        totalUltimateSortalSpecialized
      );
    }
  });
  return totalUltimateSortalSpecialized;
};

export {
  checkSortalSpecializesUniqueUltimateSortalRecursive,
  validateSortalSpecializesUniqueUltimateSortalRecursive,
};
