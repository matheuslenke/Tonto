
import { CompositeGeneratorNode, NL } from "langium/generate";
import { Class, OntoumlElement, OntoumlType } from "ontouml-js";
import { formatForId } from "../utils/replaceWhitespace.js";
import { constructClassElement } from "./classElement.constructor.js";

export function createTontoModule(element: OntoumlElement, fileNode: CompositeGeneratorNode) {
  const project = element.project;
  if (project) {
    project.getAllPackages().forEach((packageItem) => {
      if (packageItem.getName() !== "root") {
        fileNode.append(`module ${formatForId(packageItem.getName())} {`, NL);
        fileNode.indent((indent) => {
          packageItem.getAllContents().forEach((content) => {
            if (content.type === OntoumlType.CLASS_TYPE) {
              const classItem = content as Class;
              constructClassElement(classItem, indent);
            }
          });
        });
        fileNode.append("}", NL);
      }
    });
  }
}
