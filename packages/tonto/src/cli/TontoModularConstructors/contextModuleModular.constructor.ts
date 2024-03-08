
import { CompositeGeneratorNode, Generated, NL, expandToNode, joinToNode } from "langium/generate";
import { Class, OntoumlElement, OntoumlType } from "ontouml-js";
import { constructClassElement } from "../TontoConstructors/classElement.constructor.js";
import { formatForId } from "../utils/replaceWhitespace.js";

export function createTontoModuleModular(element: OntoumlElement, fileNode: CompositeGeneratorNode): Generated {
  // return generateTonto(element);
  fileNode.append(`package ${formatForId(element.getNameOrId())}`, NL, NL);
  element.getContents().forEach((content) => {
    if (content.type === OntoumlType.CLASS_TYPE) {
      const classItem = content as Class;
      constructClassElement(classItem, fileNode);
    }
  });
  fileNode.append(NL);
  return fileNode;
}

function joinWithExtraNL<T>(content: T[], toString: (e: T) => Generated): Generated {
  return joinToNode(content, toString, { appendNewLineIfNotEmpty: true });
}

export function generateTonto(element: OntoumlElement): Generated {
  const classes = element
    .getContents()
    .filter((item) => item.type === OntoumlType.CLASS_TYPE)
    .map((item) => item as Class);
  return expandToNode`
    package ${formatForId(element.getNameOrId())}

    ${joinWithExtraNL(classes, (classItem) => `${classItem.getName()}`)}
  `;
}
