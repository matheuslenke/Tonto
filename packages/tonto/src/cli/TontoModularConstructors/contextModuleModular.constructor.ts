import { CompositeGeneratorNode, NL } from "langium";
import { Class, OntoumlElement, OntoumlType } from "ontouml-js";
import { constructClassElement } from "../TontoConstructors/classElement.constructor";
import { formatForId } from "../utils/replaceWhitespace";

export function createTontoModuleModular(element: OntoumlElement, fileNode: CompositeGeneratorNode) {
  fileNode.append(`package ${formatForId(element.getNameOrId())}`, NL, NL);
  element.getContents().forEach((content) => {
    if (content.type === OntoumlType.CLASS_TYPE) {
      const classItem = content as Class;
      constructClassElement(classItem, fileNode);
    }
  });
  fileNode.append(NL);
}
