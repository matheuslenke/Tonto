
import { CompositeGeneratorNode, NL } from "langium/generate";
import { Class, OntoumlElement, OntoumlType } from "ontouml-js";
import { formatForId } from "../utils/replaceWhitespace.js";
import { constructClassElement } from "./classElement.constructor.js";

import { Generated, expandToNode, joinToNode } from "langium/generate";

/**
 * This function is the entry point for creating a Tonto Model based on an OntoUML
 * element.
 * @param element The parsed OntoUML Element from ontouml-js
 * @param fileNode The node which the generated file is created
 * @returns 
 */
export function createTontoPackage(packageItem: OntoumlElement, fileNode: CompositeGeneratorNode): Generated {
  // return generateTonto(element);
  fileNode.append(`package ${formatForId(packageItem.getNameOrId())}`, NL, NL);
  packageItem.getContents().forEach((content) => {
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
