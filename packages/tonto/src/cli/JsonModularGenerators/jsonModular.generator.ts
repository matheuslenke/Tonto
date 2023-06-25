import fs from "fs";
import { CompositeGeneratorNode } from "langium";
import { MultilingualText, Package, Project } from "ontouml-js";
import path from "path";
import { Model } from "../../language-server";
import { contextModuleGenerateRelations, contextModuleModularGenerator } from "./contextModuleModular.generator";
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
    folderAbsolutePath,
  };
  return generate(ctx);
}

export interface GeneratorContext {
  models: Model[]
  manifest: TontoManifest
  fileNode: CompositeGeneratorNode
  folderAbsolutePath: string
}

interface GeneratedModelData {
  package: Package
  model: Model
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

  const generatedModelDatas: Map<string, GeneratedModelData> = new Map();

  /**
   * First we generate all the classes for each context module
   */
  for (const model of ctx.models) {
    const contextModule = model.module;

    const createdPackage = rootPackage.createPackage(contextModule.name);

    const generatedContextModuleData = contextModuleGenerateClasses(contextModule, createdPackage);

    const generatedModelData: GeneratedModelData = {
      package: createdPackage,
      model: model,
      generatedData: generatedContextModuleData,
    };
    generatedModelDatas.set(model.module.name, generatedModelData);
  }

  /**
   * Secondly, we generate all the relations for each context module
   */
  ctx.models.forEach((model) => {
    const importedNames = model.imports.flatMap((e) => e.referencedModel.ref?.name).filter((e) => e !== undefined);
    const arrayOfGeneratedModelDatas = Array.from(generatedModelDatas.values());

    const globalDataTypes = arrayOfGeneratedModelDatas
      .filter((data) => data.model.module.isGlobal)
      .map((data) => data.generatedData);
    const importedDataTypes = arrayOfGeneratedModelDatas
      .filter((data) => importedNames.includes(data.model.module.name))
      .map((data) => data.generatedData);

    const createdPackage = generatedModelDatas.get(model.module.name)?.package;
    const generatedContextModelData = generatedModelDatas.get(model.module.name)?.generatedData;
    if (createdPackage && generatedContextModelData) {
      contextModuleGenerateRelations(model.module, createdPackage, generatedContextModelData, [
        ...importedDataTypes,
        ...globalDataTypes,
      ]);
    }
  });

  /**
   * Then, we navigate again through the models and generate the missing elements
   * that needed the references of the classes and relations generated in the previous step
   */
  ctx.models.forEach((model) => {
    const importedNames = model.imports.flatMap((e) => e.referencedModel.ref?.name).filter((e) => e !== undefined);
    const arrayOfGeneratedModelDatas = Array.from(generatedModelDatas.values());

    const globalDataTypes = arrayOfGeneratedModelDatas
      .filter((data) => data.model.module.isGlobal)
      .map((data) => data.generatedData);
    const importedDataTypes = arrayOfGeneratedModelDatas
      .filter((data) => importedNames.includes(data.model.module.name))
      .map((data) => data.generatedData);

    const createdPackage = generatedModelDatas.get(model.module.name)?.package;
    const generatedContextModelData = generatedModelDatas.get(model.module.name)?.generatedData;

    if (createdPackage && generatedContextModelData) {
      contextModuleModularGenerator(model.module, generatedContextModelData, createdPackage, [
        ...importedDataTypes,
        ...globalDataTypes,
      ]);
    }
  });
  return project;
}
