import { CompositeGeneratorNode, processGeneratorNode } from "langium";
import fs from "fs";
import path from "path";
import { Class, OntoumlElement } from "ontouml-js";

export function generateTontoFile(
  ontoumlElements: OntoumlElement[],
  filePath: string,
  destination: string | undefined
): string {
  const data = customExtractDestinationAndName(filePath, destination);
  const ctx = <GeneratorContext>{
    ontoumlElements,
    name: data.name,
    fileName: `${data.name}.tonto`,
    destination: data.destination,
    fileNode: new CompositeGeneratorNode(),
  };
  return generate(ctx);
}

interface GeneratorContext {
  ontoumlElements: OntoumlElement[];
  name: string;
  fileName: string;
  destination: string;
  fileNode: CompositeGeneratorNode;
}

function generate(ctx: GeneratorContext): string {
  ctx.ontoumlElements.forEach((ontoumlElement) => {
    createTontoModule(ontoumlElement, ctx.fileNode);
  });

  if (!fs.existsSync(ctx.destination)) {
    fs.mkdirSync(ctx.destination, { recursive: true });
  }
  const generatedFilePath = path.join(ctx.destination, ctx.fileName);
  fs.writeFileSync(generatedFilePath, processGeneratorNode(ctx.fileNode));
  return generatedFilePath;
}

function createTontoModule(
  element: OntoumlElement,
  fileNode: CompositeGeneratorNode
) {
  const name = element.project.name.getText().replace(/.*-/, "");
  fileNode.append(`module ${name} {\n`);
  element.project.getAllPackages().forEach((packageItem) => {
    packageItem.getAllClasses().forEach((classItem) => {
      createClassElement(classItem, fileNode);
    });
  });

  fileNode.append("}");
}

function createClassElement(element: Class, fileNode: CompositeGeneratorNode) {
  switch (element.stereotype) {
    case "kind":
      fileNode.append(`kind ${element.name.getText()}\n`);
      break;
    case "relator":
      fileNode.append(`relator ${element.name.getText()}\n`);
      break;

    case "datatype":
      //   fileNode.append(`datatype ${element.name.getText()}\n`);
      break;
    default:
      fileNode.append(`class ${element.name.getText()}\n`);
  }
}

interface FilePathData {
  destination: string;
  name: string;
}

export function customExtractDestinationAndName(
  filePath: string,
  destination: string | undefined
): FilePathData {
  filePath = filePath.replace(/\.json/, "");
  return {
    destination: destination ?? path.join(path.dirname(filePath), "generated"),
    name: path.basename(filePath),
  };
}
