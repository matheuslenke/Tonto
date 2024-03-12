import * as fs from "fs";
import { CompositeGeneratorNode, toString } from "langium/generate";
import { MultilingualText, OntoumlElement, OntoumlType, Package, Project } from "ontouml-js";
import * as path from "path";
import { formatForId, replaceWhitespace } from "../utils/replaceWhitespace.js";
import { createTontoImports } from "./importModular.constructor.js";
import { createTontoManifest, customExtractDestinationAndName } from "./manifest.constructor.js";
import { createTontoPackage } from "./package.constructor.js";

export function generateTontoFile(project: Project, filePath: string, destination: string | undefined): string {
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
  project: Project
  name: string
  destinationFolder: string
  fileNode: CompositeGeneratorNode
}

function generate(ctx: GeneratorContext): string {
  if (!fs.existsSync(ctx.destinationFolder)) {
    fs.mkdirSync(ctx.destinationFolder, { recursive: true });
  }
  // Create manifest file
  createTontoManifest(ctx.project, ctx.destinationFolder);

  const modelPath = path.join(ctx.destinationFolder, ctx.project.model?.getNameOrId());

  if (!fs.existsSync(modelPath)) {
    fs.mkdirSync(modelPath);
  }

  const packages = ctx.project.model.getAllPackages();

  packages.forEach((ontoumlElement) => {
    generateModel(modelPath, ontoumlElement, new CompositeGeneratorNode());
  });

  generateProject(modelPath, ctx.project, new CompositeGeneratorNode());

  return modelPath;
}

function generateModel(
  actualDestinationFolder: string,
  ontoumlElement: OntoumlElement,
  fileNode: CompositeGeneratorNode
) {
  /**
  * If it is a Project, we generate a Package with its elements, and then just 
  * enter the "Model" Package
  */
  if (ontoumlElement.type === OntoumlType.PROJECT_TYPE) {
    generateModel(actualDestinationFolder, ontoumlElement, new CompositeGeneratorNode());
  }
  /**
  * If it is a package, we need to generate again recursively
  */
  console.log(ontoumlElement.getName());
  generatePackage(actualDestinationFolder, ontoumlElement, fileNode);
}

function generatePackage(dir: string, ontoumlElement: OntoumlElement, fileNode: CompositeGeneratorNode) {
  if (ontoumlElement.type === OntoumlType.PACKAGE_TYPE) {
    const packageElement = ontoumlElement as Package;
    // Create directory for this package
    const packagePath = path.join(dir, packageElement.getName());
    let newPath: string = packagePath;
    if (!fs.existsSync(packagePath)) {
      newPath = fs.mkdirSync(packagePath, { recursive: true }) ?? packagePath;
    }
    // First, we need to generate all imports for this module
    createTontoImports(packageElement, fileNode);

    // Then, we create the elements of this package
    createTontoPackage(packageElement, fileNode);

    // Lastly, we call it again to create other packages inside it recursively
    for (const child of packageElement.getContents()) {
      if (child.type === OntoumlType.PACKAGE_TYPE || child.type === OntoumlType.PROJECT_TYPE) {
        generateModel(replaceWhitespace(newPath), child, new CompositeGeneratorNode());
      }
    }
    const generatedFilePath = path.join(newPath, formatForId(packageElement.getName())) + ".tonto";
    fs.writeFileSync(generatedFilePath, toString(fileNode));
  }
}

function generateProject(dir: string, project: Project, fileNode: CompositeGeneratorNode) {
  const rootPackageElements = project.model.getContents().filter(
    item => item.type !== OntoumlType.PACKAGE_TYPE
  );

  // Create the package

  const packagePath = path.join(dir, project.getNameOrId());

  const packageItem = new Package({
    name: new MultilingualText(project.getName()),
    id: project.getNameOrId()
  });

  createTontoImports(packageItem, fileNode);

  createTontoPackage(packageItem, fileNode);

  const generatedFilePath = path.join(packagePath, formatForId(packageItem.getNameOrId())) + ".tonto";
  fs.writeFileSync(generatedFilePath, toString(fileNode));
}

