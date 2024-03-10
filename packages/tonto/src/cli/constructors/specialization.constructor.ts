
import { CompositeGeneratorNode } from "langium/generate";
import { Class } from "ontouml-js";
import { formatForId } from "../utils/replaceWhitespace.js";

export function createSpecializations(element: Class, fileNode: CompositeGeneratorNode) {
  const generalizations = element.getGeneralizationsWhereSpecific();

  if (generalizations.length > 0) {
    fileNode.append(" specializes ");
    generalizations.forEach((generalization, index) => {
      fileNode.append(`${formatForId(generalization.getGeneralClass().getName())}`);
      if (index < generalizations.length - 1) {
        fileNode.append(", ");
      }
    });
  }
}
