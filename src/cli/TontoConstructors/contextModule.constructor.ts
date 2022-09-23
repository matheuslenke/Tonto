import { CompositeGeneratorNode, NL } from "langium";
import { Class, ModelElement, OntoumlElement, OntoumlType } from "ontouml-js";
import { constructClassElement } from "../TontoConstructors/classElement.constructor";

export function createTontoModule(
  element: OntoumlElement,
  fileNode: CompositeGeneratorNode
) {
  const project = element.project;
  if (project) {
    project.getAllPackages().forEach((packageItem) => {
      if (packageItem.name.getText() !== "root") {
        fileNode.append(`module ${packageItem.getName()} {`, NL);
        fileNode.indent((indent) => {
          packageItem.getAllContents().forEach((content) => {
            if (content.type === OntoumlType.CLASS_TYPE) {
              const classItem = content as Class;
              constructClassElement(packageItem, classItem, indent);
            }
          });
        });
        fileNode.append("}", NL);
      }
    });
  }
}

function isOntoumlModel(
  pet: OntoumlElement | ModelElement
): pet is ModelElement {
  return (<ModelElement>pet).name !== undefined;
}
