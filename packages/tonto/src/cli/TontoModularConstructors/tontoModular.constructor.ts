import fs from "fs";
import { CompositeGeneratorNode, toString } from "langium";
import { OntoumlElement, OntoumlType, Package, Project } from "ontouml-js";
import path from "path";
import { TontoManifest, toJson } from "../model/TontoManifest";
import { createTontoModuleModular } from "./contextModuleModular.constructor";
import { createTontoImports } from "./importModular.constructor";
import { formatForId, replaceWhitespace } from "../utils/replaceWhitespace";

export function generateTontoFileModular(
  project: Project,
  filePath: string,
  destination: string | undefined
): string {
  const data = customExtractDestinationAndName(filePath, destination);
  const ctx = <GeneratorContext>{
    project,
    name: data.name,
    destinationFolder: data.destination,
    fileNode: new CompositeGeneratorNode(),
  };
  return generate(ctx);
}

interface GeneratorContext {
  project: Project;
  name: string;
  destinationFolder: string;
  fileNode: CompositeGeneratorNode;
}

function generate(ctx: GeneratorContext): string {

  if (!fs.existsSync(ctx.destinationFolder)) {
    fs.mkdirSync(ctx.destinationFolder, { recursive: true });
  }
  // Create manifest file
  createTontoManifest(ctx);

  const modelPath = path.join(ctx.destinationFolder, ctx.project.model?.getNameOrId());

  if (!fs.existsSync(modelPath)) {
    fs.mkdirSync(modelPath);
  }

  ctx.project.model.getContents().forEach((ontoumlElement) => {
    const fileNode = new CompositeGeneratorNode();
    generateModule(modelPath, ontoumlElement, fileNode);
  });

  return modelPath;
}

function generateModule(
  actualDestinationFolder: string,
  ontoumlElement: OntoumlElement,
  fileNode: CompositeGeneratorNode
) {
  /**
   * If it is a Project, we just enter the "Model" Package
   */
  if (ontoumlElement.type === OntoumlType.PROJECT_TYPE) {
    generateModule(actualDestinationFolder, ontoumlElement, new CompositeGeneratorNode());
  }
  /**
   * If it is a package, we need to generate again recursively
   */
  if (ontoumlElement.type === OntoumlType.PACKAGE_TYPE) {
    const packageElement = ontoumlElement as Package;
    // Create directory for this package
    const packagePath = path.join(actualDestinationFolder, packageElement.getName());
    let newPath: string = packagePath;
    if (!fs.existsSync(packagePath)) {
      newPath = fs.mkdirSync(packagePath, { recursive: true }) ?? packagePath;
    }
    /**
     * First, we need to generate all imports for this module
     */
    createTontoImports(packageElement, fileNode);
    /**
     * Then, we create the elements of this package
     */
    createTontoModuleModular(packageElement, fileNode);

    // Lastly, we call it again to create other packages inside it recursively
    for (const child of packageElement.getContents()) {
      if (child.type === OntoumlType.PACKAGE_TYPE || child.type === OntoumlType.PROJECT_TYPE) {
        generateModule(replaceWhitespace(newPath), child, new CompositeGeneratorNode());
      }
    }
    const generatedFilePath = path.join(newPath,
      formatForId(packageElement.getName())) + ".tonto";
    fs.writeFileSync(generatedFilePath, toString(fileNode));
  }
}

function createTontoManifest(ctx: GeneratorContext) {
  const manifest: TontoManifest = {
    projectName: formatForId(ctx.project.getNameOrId()),
    version: "1.0",
    displayName: ctx.project.getNameOrId(),
    license: "",
    publisher: "",
    dependencies: {},
    outFolder: ""
  };
  const jsonString = toJson(manifest);
  const manifestPath = path.join(ctx.destinationFolder, "tonto.json");
  fs.writeFileSync(manifestPath, jsonString);
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
