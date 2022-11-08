import { ValidationAcceptor } from "langium";
import { ClassDeclaration } from "../generated/ast";
import { EndurantTypes } from "../models/EndurantType";

const checkSortalSpecializesUniqueUltimateSortalRecursive = (
  actualElement: ClassDeclaration,
  verificationList: ClassDeclaration[],
  totalUltimateSortalSpecialized: number,
  accept: ValidationAcceptor
): void => {
  actualElement.specializationEndurants.forEach((specializationItem) => {
    const specItem = specializationItem.ref;
    if (!specItem) {
      return;
    }

    const category = specItem.classElementType?.ontologicalCategory;
    if (
      category === EndurantTypes.KIND ||
      category === EndurantTypes.SUBKIND ||
      category === EndurantTypes.QUALITY ||
      category === EndurantTypes.QUANTITY ||
      category === EndurantTypes.RELATOR ||
      category === EndurantTypes.MODE ||
      category === EndurantTypes.INTRINSIC_MODE ||
      category === EndurantTypes.EXTRINSIC_MODE ||
      category === EndurantTypes.COLLECTIVE
    ) {
      if (totalUltimateSortalSpecialized > 0) {
        accept(
          "warning",
          "Every sortal class must specialize a unique ultimate sortal (Kind, Collective, Quantity, Relator, Quality or mode)",
          { node: actualElement }
        );
      } else {
        totalUltimateSortalSpecialized += 1;
        checkSortalSpecializesUniqueUltimateSortalRecursive(
          specItem,
          verificationList,
          totalUltimateSortalSpecialized,
          accept
        );
      }
    }
  });
};

export { checkSortalSpecializesUniqueUltimateSortalRecursive };
