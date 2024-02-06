import { NodeFileSystem } from "langium/node";
import { Model, createTontoServices } from "../../language/index.js";
import { extractAllAstNodes } from "../cli-util.js";
import chalk from "chalk";
import { builtInLibs } from "../../language/workspace/builtins/index.js";
import { glob } from "glob";
import { parseProject } from "../JsonModularGenerators/jsonModular.generator.js";
import * as path from "node:path";
import { CompositeGeneratorNode } from "langium";
import * as fs from "node:fs";
import { GeneratorContext } from "../JsonModularGenerators/jsonModular.generator.js";
import { TontoManifest, createDefaultTontoManifest } from "../model/TontoManifest.js";
import { ResultResponse, ErrorResultResponse, validateTontoFile } from "../requests/ontoumljsValidator.js";

export const validateAction = async (dirName: string): Promise<void> => {
  if (!dirName) {
    console.log(chalk.red("Directory not provided!"));
    return;
  }
  console.log(chalk.bold("Validating..."));

  try {
    const response = await validateCommand(dirName);

    // If it is ResultResponse[]
    if (Array.isArray(response)) {
      const resultResponses = response as ResultResponse[];
      resultResponses.forEach((resultResponse) => {
        console.log(chalk.bold.redBright(`[${resultResponse.severity}] ${resultResponse.title}:`));
        console.log(chalk.red(resultResponse.description));
      });
    } else {
      const error = response as ErrorResultResponse;
      console.log(chalk.bold.red(error.message));
    }
    console.log(chalk.bold.green("Validation finished"));
  } catch (error) {
    console.log(chalk.red(error));
  }
};

export const validateCommand = async (dirName: string): Promise<ResultResponse[] | ErrorResultResponse> => {
  const services = createTontoServices({ ...NodeFileSystem }).Tonto;

  let manifest: TontoManifest | undefined;

  const folderAbsolutePath = path.resolve(dirName);
  console.log(folderAbsolutePath);
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
    } as ErrorResultResponse;
  }

  const allFiles = await glob(dirName + "/**/*.tonto");

  const models: Model[] = await extractAllAstNodes(allFiles, services, builtInLibs, false);

  const context: GeneratorContext = {
    models,
    fileNode: new CompositeGeneratorNode(),
    manifest: manifest,
    folderAbsolutePath,
  };

  const project = parseProject(context);

  const validationResult = validateTontoFile(project);

  if (validationResult) {
    return validationResult;
  } else {
    return {
      status: 500,
      message: "Validation failed",
    } as ErrorResultResponse;
  }
};
