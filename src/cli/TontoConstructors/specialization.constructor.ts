import { CompositeGeneratorNode } from "langium";
import { Class } from "ontouml-js";

export function createSpecializations(
  element: Class,
  fileNode: CompositeGeneratorNode
) {
  const generalizations = element.getGeneralizationsWhereSpecific();

  if (generalizations.length > 0) {
    fileNode.append(" specializes ");
    generalizations.forEach((generalization, index) => {
      fileNode.append(`${generalization.getGeneralClass().getName()}`);
      if (index < generalizations.length - 1) {
        fileNode.append(", ");
      }
    });
  }
}
