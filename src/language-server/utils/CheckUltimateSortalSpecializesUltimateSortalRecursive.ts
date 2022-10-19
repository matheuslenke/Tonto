import { ValidationAcceptor } from "langium";
import { ClassElement } from "../generated/ast";
import { EndurantTypes } from "../models/EndurantType";

const checkUltimateSortalSpecializesUltimateSortalRecursive = (
  actualElement: ClassElement,
  accept: ValidationAcceptor
): void => {
  actualElement.specializationEndurants.forEach((specializationItem) => {
    const specItem = specializationItem.ref;
    if (!specItem) {
      return;
    }

    const refType = specItem.classElementType?.stereotype;
    
    if (
      refType === EndurantTypes.KIND ||
      refType === EndurantTypes.COLLECTIVE ||
      refType === EndurantTypes.QUANTITY ||
      refType === EndurantTypes.QUALITY ||
      refType === EndurantTypes.RELATOR ||
      refType === EndurantTypes.MODE ||
      refType === EndurantTypes.INTRINSIC_MODE ||
      refType === EndurantTypes.EXTRINSIC_MODE
    ) {
      accept(
        "warning",
        "Classes representing ultimate sortals cannot specialize other ultimate sortals",
        { node: actualElement }
      );
      return;
    } else {
        checkUltimateSortalSpecializesUltimateSortalRecursive(specItem, accept);
    }
  });
};

export { checkUltimateSortalSpecializesUltimateSortalRecursive };
