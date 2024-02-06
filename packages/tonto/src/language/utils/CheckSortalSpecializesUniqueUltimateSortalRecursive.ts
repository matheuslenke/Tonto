import { ErrorMessages } from "../models/ErrorMessages.js";
import { ValidationAcceptor } from "langium";
import { ClassDeclaration, GeneralizationSet } from "../generated/ast.js";
import { isUltimateSortalOntoCategory } from "../models/OntologicalCategory.js";

const validateSortalSpecializesUniqueUltimateSortalRecursive = (
  actualElement: ClassDeclaration,
  totalUltimateSortalSpecialized: number,
  accept: ValidationAcceptor
): void => {
  const totalUltimateSortalSpecializations = checkSortalSpecializesUniqueUltimateSortalRecursive(
    actualElement,
    [],
    accept,
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
  actualElement: ClassDeclaration | GeneralizationSet,
  genSets: GeneralizationSet[],
  accept: ValidationAcceptor,
  totalUltimateSortalSpecialized: number
): number => {
  if (totalUltimateSortalSpecialized >= 2) {
    return totalUltimateSortalSpecialized;
  }
  /**
   * If the element is a ClassDeclaration, then we need to check its specialization items. And we need
   * also to check all generalization sets where this class is the specific
   */
  if (actualElement.$type === "ClassDeclaration") {
    actualElement.specializationEndurants.forEach((specializationItem) => {
      const specItem = specializationItem.ref;
      if (specItem) {
        const specCategory = specItem.classElementType?.ontologicalCategory;
        if (isUltimateSortalOntoCategory(specCategory)) {
          totalUltimateSortalSpecialized += 1;
        }

        totalUltimateSortalSpecialized = checkSortalSpecializesUniqueUltimateSortalRecursive(
          specItem,
          genSets,
          accept,
          totalUltimateSortalSpecialized
        );
      }
    });
    const genSetsWithElement: GeneralizationSet[] = getGensetsWhereSpecific(actualElement.name, genSets);

    genSetsWithElement.forEach((genSet) => {
      totalUltimateSortalSpecialized = checkSortalSpecializesUniqueUltimateSortalRecursive(
        genSet,
        genSets,
        accept,
        totalUltimateSortalSpecialized
      );
    });
  } else if (actualElement.$type === "GeneralizationSet") {
    /**
     * If the element is a GeneralizationSet, then we need to check the general element and go up from there
     */
    const generalItem = actualElement.generalItem.ref;
    if (!generalItem || generalItem.$type !== "ClassDeclaration") {
      return totalUltimateSortalSpecialized;
    }
    if (isUltimateSortalOntoCategory(generalItem.classElementType?.ontologicalCategory)) {
      totalUltimateSortalSpecialized += 1;
    }

    generalItem.specializationEndurants.forEach((specializationItem) => {
      const specItem = specializationItem.ref;
      if (specItem) {
        if (isUltimateSortalOntoCategory(specItem.classElementType?.ontologicalCategory)) {
          totalUltimateSortalSpecialized += 1;
        }
        totalUltimateSortalSpecialized = checkSortalSpecializesUniqueUltimateSortalRecursive(
          specItem,
          genSets,
          accept,
          totalUltimateSortalSpecialized
        );
      }
    });

    const genSetsWhereElementIsSpecific = getGensetsWhereSpecific(generalItem.name ?? "", genSets);

    genSetsWhereElementIsSpecific.forEach((genSet) => {
      totalUltimateSortalSpecialized = checkSortalSpecializesUniqueUltimateSortalRecursive(
        genSet,
        genSets,
        accept,
        totalUltimateSortalSpecialized
      );
    });
  }
  return totalUltimateSortalSpecialized;
};

function getGensetsWhereSpecific(declaration: string, genSets: GeneralizationSet[]): GeneralizationSet[] {
  return genSets.filter((genSet) => {
    const specificItem = genSet.specificItems.find((specific) => specific.ref?.name === declaration);
    return specificItem ?? undefined;
  });
}

export { checkSortalSpecializesUniqueUltimateSortalRecursive, validateSortalSpecializesUniqueUltimateSortalRecursive };
