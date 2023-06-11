import { extractAllAstNodes, extractAstNode } from "../cli-util";
import { generateJSONFile } from "../jsonGenerator";
import { NodeFileSystem } from "langium/node";
import chalk from "chalk";
import { glob } from "glob";
import path from "path";
import { generateJSONFileModular } from "../JsonModularGenerators/jsonModular.generator";
import { TontoManifest } from "../model/TontoManifest";
import { builtInLibs } from "../../language-server/workspace/builtins";
import { createTontoServices, Model, TontoServices } from "../../language-server";
import { readOrCreateDefaultTontoManifest } from "../utils/readManifest";

export type GenerateOptions = {
  destination?: string;
};

export const generateSingleAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
  generateCommand(fileName, opts);
};

export const generateAction = async (dir: string, _opts: GenerateOptions): Promise<void> => {
  if (!dir) {
    console.log(chalk.red("Directory not provided!"));
    return;
  }
  try {
    const generatedFile = await generateModularCommand(dir);
    if (generatedFile) {
      console.log(chalk.green(`JSON File generated successfully: ${generatedFile}`));
    }
  } catch (error) {
    console.log(chalk.red(error));
  }
};

export const generateCommand = async (fileName: string, opts: GenerateOptions): Promise<string | undefined> => {
  const services = createTontoServices({ ...NodeFileSystem }).Tonto;
  const model = await extractAstNode<Model>(fileName, services);
  const generatedFilePath = generateJSONFile(model, fileName, opts.destination);
  return generatedFilePath;
};

// TODO: Make this function generate file on folder
export async function generateModularCommand(dir: string): Promise<string | undefined> {
  const services = createTontoServices({ ...NodeFileSystem }).Tonto;

  let manifest: TontoManifest;
  let folderAbsolutePath: string;
  // Find tonto.json file
  try {
    /**
     * Create Tonto Manifest file if it does not exist or read from an existing
     * one
     */
    manifest = readOrCreateDefaultTontoManifest(dir);

    console.log(chalk.bold("tonto.json file parsed successfully."));
    folderAbsolutePath = path.resolve(dir);
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
  folderAbsolutePath: string
): Promise<string | undefined> {
  const allFiles = await glob(dir + "/**/*.tonto");

  const models: Model[] = await extractAllAstNodes(allFiles, services, builtInLibs, "none");

  generateJSONFileModular(models, manifest, folderAbsolutePath);

  return `${manifest.projectName}.json`;
}
