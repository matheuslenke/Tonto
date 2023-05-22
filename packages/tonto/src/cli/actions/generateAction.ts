import { extractAllAstNodes, extractAstNode } from "../cli-util";
import { generateJSONFile } from "../jsonGenerator";
import { NodeFileSystem } from "langium/node";
import { createTontoServices, Model, TontoServices } from "../../language-server";
import chalk from "chalk";
import { glob } from "glob";
import { Project, MultilingualText } from "ontouml-js";
import path from "path";
import { basicDataTypes } from "../../language-server/workspace/builtins/basicDataTypes";
import { generateJSONFileModular } from "../JsonModularGenerators/jsonModular.generator";
import { BuiltInLib } from "../model/BuiltInLib";
import { TontoManifest } from "../model/TontoManifest";
import fs from "fs";

export type GenerateOptions = {
  destination?: string;
};

export const generateSingleAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
  generateCommand(fileName, opts);
};

export const generateAction = async (
  dir: string,
  _opts: GenerateOptions
): Promise<void> => {

  if (!dir) {
    console.log(chalk.red("Directory not provided!"));
    return;
  }
  try {
    const generatedFile = await generateModularCommand(dir);
    if (generatedFile) {
      console.log(
        chalk.green(`JSON File generated successfully: ${generatedFile}`)
      );
    }
  } catch (error) {
    console.log(chalk.red(error));
  }
};

export const generateCommand = async (
  fileName: string,
  opts: GenerateOptions
): Promise<string | undefined> => {
  const services = createTontoServices({ ...NodeFileSystem }).Tonto;
  const model = await extractAstNode<Model>(fileName, services);
  const generatedFilePath = generateJSONFile(model, fileName, opts.destination);
  return generatedFilePath;
};


// TODO: Make this function generate file on folder
export async function generateModularCommand(dir: string): Promise<string | undefined> {
  const services = createTontoServices({ ...NodeFileSystem }).Tonto;

  let manifest: TontoManifest | undefined = undefined;
  let folderAbsolutePath: string | undefined = undefined;
  // Find tonto.json file
  try {
    folderAbsolutePath = path.resolve(dir);
    const tontoManifest = fs.readdirSync(dir).includes("tonto.json");
    if (tontoManifest === undefined) {
      console.log(chalk.red("tonto.json not found!"));
      return Promise.reject();
    }
    const filePath = path.join(dir, "tonto.json");

    const tontoManifestContent = fs.readFileSync(filePath, "utf-8");

    manifest = JSON.parse(tontoManifestContent);
    if (manifest === undefined) {
      throw new Error("Manifest file \"tonto.json\" not found");
    }
    console.log(chalk.bold("tonto.json file parsed successfully."));

    const createdFile = await createModel(dir, manifest, services, folderAbsolutePath);

    console.log(chalk.green("JSON File generated successfully: "));
    return Promise.resolve(createdFile);
  } catch (error) {
    console.log(chalk.red(error));
    return Promise.reject();
  }
}

async function createModel(
  dir: string,
  manifest: TontoManifest,
  services: TontoServices,
  folderAbsolutePath: string,
): Promise<string | undefined> {
  const project = new Project({
    name: new MultilingualText(manifest.projectName),
  });
  const rootPackage = project.createModel({
    name: new MultilingualText(manifest.projectName),
  });

  const allFiles = await glob(dir + "/**/*.tonto");
  // // Load all builtIn files
  const dataTypesLib: BuiltInLib = {
    uri: "builtin://basicDatatypes.tonto",
    content: basicDataTypes
  };

  // TODO
  const models: Model[] = await extractAllAstNodes(allFiles, services, [dataTypesLib]);

  generateJSONFileModular(models, project, rootPackage, manifest, folderAbsolutePath);

  return `${manifest.projectName}.json`;
}
