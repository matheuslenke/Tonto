import { NodeFileSystem } from "langium/node";
import { Model, createTontoServices } from "../../language-server";
import { extractAllAstNodes } from "../cli-util";
import chalk from "chalk";
import { builtInLibs } from "../../language-server/workspace/builtins";
import { glob } from "glob";
import { parseProject } from "../JsonModularGenerators/jsonModular.generator";
import path from "path";
import { CompositeGeneratorNode } from "langium";
import fs from "fs";
import { GeneratorContext } from "../JsonModularGenerators/jsonModular.generator";
import { TontoManifest, createDefaultTontoManifest } from "../model/TontoManifest";
import { ResultResponse, ErrorResultResponse, validateTontoFile } from "../requests/ontoumljsValidator";

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

  const models: Model[] = await extractAllAstNodes(allFiles, services, builtInLibs, "none");

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
