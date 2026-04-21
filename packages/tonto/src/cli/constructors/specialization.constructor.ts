
import { CompositeGeneratorNode } from "langium/generate";
import { Class } from "ontouml-js";
import { formatElementReference, getContainingPackageName } from "./renderUtils.js";

export function createSpecializations(element: Class, fileNode: CompositeGeneratorNode) {
    const generalizations = element.getGeneralizationsWhereSpecific();
    const currentPackageName = getContainingPackageName(element);

    if (generalizations.length > 0) {
        fileNode.append(" specializes ");
        generalizations.forEach((generalization, index) => {
            fileNode.append(formatElementReference(generalization.getGeneralClass(), currentPackageName));
            if (index < generalizations.length - 1) {
                fileNode.append(", ");
            }
        });
    }
}
