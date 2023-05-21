import fs from "fs";
import { CompositeGeneratorNode } from "langium";
import { OntoumlElement } from "ontouml-js";
import path from "path";
import { createTontoModule } from "./TontoConstructors/contextModule.constructor";

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
  // fs.writeFileSync(generatedFilePath, isGeneratorNode(ctx.fileNode));
  return generatedFilePath;
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
