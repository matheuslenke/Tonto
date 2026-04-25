import { ValidationAcceptor } from "langium";
import { ClassDeclaration } from "../generated/ast.js";
import { ErrorMessages } from "../models/ErrorMessages.js";
import { isUltimateSortalOntoCategory } from "../models/OntologicalCategory.js";

const checkUltimateSortalSpecializesUltimateSortalRecursive = (
    actualElement: ClassDeclaration,
    accept: ValidationAcceptor
): void => {
    actualElement.specializationEndurants.forEach((specializationItem) => {
        const specItem = specializationItem.ref;
        if (!specItem) {
            return;
        }

        const refOntologicalCategory = specItem?.classElementType?.ontologicalCategory;

        if (refOntologicalCategory && isUltimateSortalOntoCategory(refOntologicalCategory)) {
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
