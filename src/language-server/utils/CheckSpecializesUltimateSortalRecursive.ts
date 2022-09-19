import { ValidationAcceptor } from "langium";
import { ClassElement } from "../generated/ast";
import { EndurantTypes } from "../models/EndurantType";

const checkSpecializesUltimateSortalRecursive = (
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

    const refType = specItem.$type;

    if (
      refType === EndurantTypes.KIND ||
      refType === EndurantTypes.SUBKIND ||
      refType === EndurantTypes.QUALITY ||
      refType === EndurantTypes.QUANTITY ||
      refType === EndurantTypes.RELATOR ||
      refType === EndurantTypes.MODE ||
      refType === EndurantTypes.INTRINSIC_MODE ||
      refType === EndurantTypes.EXTRINSIC_MODE ||
      refType === EndurantTypes.COLLECTIVE
    ) {
      if (totalUltimateSortalSpecialized > 0) {
        accept(
          "warning",
          "Every sortal class must specialize a unique ultimate sortal (Kind, Collective, Quantity, Relator, Quality or mode)",
          { node: specItem }
        );
      } else {
        totalUltimateSortalSpecialized += 1
        checkSpecializesUltimateSortalRecursive(
          specItem,
          verificationList,
          totalUltimateSortalSpecialized,
          accept
        );
      }
    }
  });
};

export { checkSpecializesUltimateSortalRecursive };
