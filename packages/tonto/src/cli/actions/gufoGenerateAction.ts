import { NodeFileSystem } from "langium/node";
import { Model, createTontoServices } from "../../language-server/index.js";
import { extractAllAstNodes } from "../cli-util.js";
import chalk from "chalk";
import { builtInLibs } from "../../language-server/workspace/builtins/index.js";
import { glob } from "glob";
import { parseProject } from "../JsonModularGenerators/jsonModular.generator.js";
import path from "path";
import { CompositeGeneratorNode } from "langium";
import fs from "fs";
import { GeneratorContext } from "../JsonModularGenerators/jsonModular.generator.js";
import { TontoManifest, createDefaultTontoManifest } from "../model/TontoManifest.js";
import { ErrorGufoResultResponse, GufoResultResponse, TransformTontoToGufo } from "../requests/gufoTransform.js";
import { readOrCreateDefaultTontoManifest } from "../utils/readManifest.js";

export const transformToGufoAction = async (dirName: string): Promise<void> => {
  if (!dirName) {
    console.log(chalk.red("Directory not provided!"));
    return;
  }
  console.log(chalk.bold("Transforming to gufo..."));

  try {
    const manifest = readOrCreateDefaultTontoManifest(dirName);
    const response = await transformToGufoCommand(dirName);

    if (isGufoResultResponse(response)) {
      const resultResponse = response as GufoResultResponse;
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
      }
      fs.writeFileSync(path.join(dirName, manifest.outFolder, "gufo.ttl"), resultResponse.result);
      console.log(resultResponse.result);
    } else {
      const errorResponse = response as ErrorGufoResultResponse;
      errorResponse.info.forEach((errorInfo) => {
        console.log(chalk.bold.redBright(`[${errorInfo.severity}] ${errorInfo.title}:`));
        console.log(chalk.red(errorInfo.description));
      });
    }
    console.log(chalk.bold.green("Transformation to Gufo finished"));
  } catch (error) {
    console.log(chalk.red(error));
  }
};

export const transformToGufoCommand = async (
  dirName: string
): Promise<GufoResultResponse | ErrorGufoResultResponse> => {
  const services = createTontoServices({ ...NodeFileSystem }).Tonto;

  let manifest: TontoManifest | undefined;

  const folderAbsolutePath = path.resolve(dirName);

  if (!fs.existsSync(path.join(folderAbsolutePath, "tonto.json"))) {
    manifest = createDefaultTontoManifest();
  } else {
    const filePath = path.join(dirName, "tonto.json");

    const tontoManifestContent = fs.readFileSync(filePath, "utf-8");
    manifest = JSON.parse(tontoManifestContent);
  }

  if (manifest === undefined) {
    return {
      status: 400,
      message: "Could not find or create default tonto.json file",
    } as ErrorGufoResultResponse;
  }

  const allFiles = await glob(dirName + "/**/*.tonto");

  const models: Model[] = await extractAllAstNodes(allFiles, services, builtInLibs, "none");

  const context: GeneratorContext = {
    models,
    fileNode: new CompositeGeneratorNode(),
    manifest: manifest,
    folderAbsolutePath,
  };

  const project = parseProject(context);

  const transformResult = TransformTontoToGufo(project);
  if (transformResult) {
    return transformResult;
  } else {
    return {
      status: 500,
      message: "Transformation failed",
    } as ErrorGufoResultResponse;
  }
};

export function isGufoResultResponse(value: any): value is GufoResultResponse | ErrorGufoResultResponse {
  if (typeof value === "object" && value !== null) {
    if ("result" in value) {
      return typeof value.result === "string";
    } else if ("info" in value) {
      return !Array.isArray(value.info);
    }
  }
  return false;
}
