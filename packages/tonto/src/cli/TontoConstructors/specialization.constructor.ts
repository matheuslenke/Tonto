import { CompositeGeneratorNode } from "langium";
import { Class } from "ontouml-js";
import { formatForId } from "../utils/replaceWhitespace";

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
