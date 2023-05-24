import fs from "fs";
import { CompositeGeneratorNode } from "langium";
import { MultilingualText, Package, Project } from "ontouml-js";
import path from "path";
import { Model } from "../../language-server";
import { contextModuleModularGenerator } from "./contextModuleModular.generator";
import { TontoManifest } from "../model/TontoManifest";
import { GeneratedContextModuleData, contextModuleGenerateClasses } from "./contextModuleModular.generator";

export function generateJSONFileModular(
  models: Model[],
  tontoManifest: TontoManifest,
  folderAbsolutePath: string
): string {

  const ctx = <GeneratorContext>{
    models,
    manifest: tontoManifest,
    fileNode: new CompositeGeneratorNode(),
    folderAbsolutePath
  };
  return generate(ctx);
}

export interface GeneratorContext {
  models: Model[];
  manifest: TontoManifest;
  fileNode: CompositeGeneratorNode;
  folderAbsolutePath: string;
}

interface GeneratedModelData {
  package: Package,
  model: Model,
  generatedData: GeneratedContextModuleData
}

function generate(ctx: GeneratorContext): string {

  /**
   * First we need to parse the project and create all elements
   */
  const project = parseProject(ctx);

  /**
   * Now, we convert the project to JSON and save it to a file
   */
  const destinationFolder = path.join(ctx.folderAbsolutePath, ctx.manifest.outFolder);
  const destinationFile = path.join(destinationFolder, project.name.getText() + ".json");

  const projectSerialization = JSON.stringify(project, null, 2);
  ctx.fileNode.append(projectSerialization);

  if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder);
  }

  fs.writeFileSync(destinationFile, projectSerialization);
  return destinationFile;
}

export function parseProject(ctx: GeneratorContext): Project {
  const project = new Project({
    name: new MultilingualText(ctx.manifest.projectName),
  });

  const rootPackage = project.createModel({
    name: new MultilingualText(ctx.manifest.projectName),
  });

  const generatedModelDatas: GeneratedModelData[] = [];

  /**
   * First we generate all the classes for each context module
   */
  ctx.models.forEach(model => {
    const contextModule = model.module;

    const createdPackage = rootPackage.createPackage(contextModule.name);

    const generatedContextModuleData = contextModuleGenerateClasses(contextModule, createdPackage);
    const generatedModelData: GeneratedModelData = {
      package: createdPackage,
      model: model,
      generatedData: generatedContextModuleData
    };
    generatedModelDatas.push(generatedModelData);
  });

  /**
   * Then, we navigate again through the models and generate the missing elements
   * that needed the references of the classes generated in the previous step
   */
  ctx.models.forEach(model => {
    const importedNames = model.imports.flatMap(e => e.referencedModel.ref?.name).filter(e => e !== undefined);
    const globalDataTypes = generatedModelDatas
      .filter(data => data.model.module.isGlobal)
      .map(data => data.generatedData);
    const importedDataTypes = generatedModelDatas
      .filter(data => importedNames.includes(data.model.module.name))
      .map(data => data.generatedData);
    const createdPackage = generatedModelDatas.find(data => data.model === model)?.package;

    const modelData = generatedModelDatas.find(data => data.model.module.name === model.module.name)?.generatedData;

    if (createdPackage && modelData) {
      contextModuleModularGenerator(model.module,
        modelData,
        createdPackage,
        [...importedDataTypes, ...globalDataTypes]);
    }
  });
  return project;
}
