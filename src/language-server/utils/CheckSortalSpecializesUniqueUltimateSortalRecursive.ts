import { ValidationAcceptor } from "langium";
import { ClassElement } from "../generated/ast";
import { EndurantTypes } from "../models/EndurantType";

const checkSortalSpecializesUniqueUltimateSortalRecursive = (
  actualElement: ClassElement,
  verificationList: ClassElement[],
  totalUltimateSortalSpecialized: number,
  accept: ValidationAcceptor
): void => {
  actualElement.specializationEndurants.forEach((specializationItem) => {
    const specItem = specializationItem.ref;
    if (!specItem) {
      return;
    }

    const stereotype = specItem.classElementType?.stereotype;
    if (
      stereotype === EndurantTypes.KIND ||
      stereotype === EndurantTypes.SUBKIND ||
      stereotype === EndurantTypes.QUALITY ||
      stereotype === EndurantTypes.QUANTITY ||
      stereotype === EndurantTypes.RELATOR ||
      stereotype === EndurantTypes.MODE ||
      stereotype === EndurantTypes.INTRINSIC_MODE ||
      stereotype === EndurantTypes.EXTRINSIC_MODE ||
      stereotype === EndurantTypes.COLLECTIVE
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
