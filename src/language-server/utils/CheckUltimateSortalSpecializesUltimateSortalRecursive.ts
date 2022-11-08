import { ValidationAcceptor } from "langium";
import { ClassDeclaration } from "../generated/ast";
import { EndurantTypes } from "../models/EndurantType";

const checkUltimateSortalSpecializesUltimateSortalRecursive = (
  actualElement: ClassDeclaration,
  accept: ValidationAcceptor
): void => {
  actualElement.specializationEndurants.forEach((specializationItem) => {
    const specItem = specializationItem.ref;
    if (!specItem) {
      return;
    }

    const refOntologicalCategory = specItem.classElementType?.ontologicalCategory;
    
    if (
      refOntologicalCategory === EndurantTypes.KIND ||
      refOntologicalCategory === EndurantTypes.COLLECTIVE ||
      refOntologicalCategory === EndurantTypes.QUANTITY ||
      refOntologicalCategory === EndurantTypes.QUALITY ||
      refOntologicalCategory === EndurantTypes.RELATOR ||
      refOntologicalCategory === EndurantTypes.MODE ||
      refOntologicalCategory === EndurantTypes.INTRINSIC_MODE ||
      refOntologicalCategory === EndurantTypes.EXTRINSIC_MODE
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
