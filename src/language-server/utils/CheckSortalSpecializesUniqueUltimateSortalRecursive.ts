import { ValidationAcceptor } from "langium";
import { ClassDeclaration } from "../generated/ast";
import { OntologicalCategoryEnum } from "../models/OntologicalCategory";

const validateSortalSpecializesUniqueUltimateSortalRecursive = (
    actualElement: ClassDeclaration,
    verificationList: ClassDeclaration[],
    totalUltimateSortalSpecialized: number,
    accept: ValidationAcceptor
): void => {

    const totalUltimateSortalSpecializations = checkSortalSpecializesUniqueUltimateSortalRecursive(actualElement, verificationList, totalUltimateSortalSpecialized)
    if (totalUltimateSortalSpecializations > 1) {
        accept(
            "error",
            "Every sortal class must specialize a unique ultimate sortal (Kind, Collective, Quantity, Relator, Quality or Mode)",
            { node: actualElement }
        );
    }
};

const checkSortalSpecializesUniqueUltimateSortalRecursive = (
    actualElement: ClassDeclaration,
    verificationList: ClassDeclaration[],
    totalUltimateSortalSpecialized: number,
): number => {
    actualElement.specializationEndurants.forEach((specializationItem) => {
        const specItem = specializationItem.ref;
        if (specItem) {
            const specCategory = specItem.classElementType?.ontologicalCategory;
            if (
                specCategory === OntologicalCategoryEnum.KIND ||
              specCategory === OntologicalCategoryEnum.COLLECTIVE ||
              specCategory === OntologicalCategoryEnum.QUANTITY ||
              specCategory === OntologicalCategoryEnum.QUALITY ||
              specCategory === OntologicalCategoryEnum.RELATOR ||
              specCategory === OntologicalCategoryEnum.MODE ||
              specCategory === OntologicalCategoryEnum.EXTRINSIC_MODE ||
              specCategory === OntologicalCategoryEnum.INTRINSIC_MODE
            ) {
                totalUltimateSortalSpecialized += 1;
                checkSortalSpecializesUniqueUltimateSortalRecursive(
                    specItem,
                    verificationList,
                    totalUltimateSortalSpecialized
                );
            }
        }
    });
    return totalUltimateSortalSpecialized
};

export { checkSortalSpecializesUniqueUltimateSortalRecursive, validateSortalSpecializesUniqueUltimateSortalRecursive };
