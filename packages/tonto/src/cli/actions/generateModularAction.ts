import chalk from "chalk";
import fs from "fs";
import { NodeFileSystem } from "langium/node";
import path from "path";

import { MultilingualText, Project } from "ontouml-js";
import { Model } from "../../../src/language-server/generated/ast";
import { extractAllAstNodes } from "../cli-util";
import { TontoManifest } from "../model/TontoManifest";
import { glob } from "glob";
import { BuiltInLib } from "../model/BuiltInLib";
import { generateJSONFileModular } from "../JsonModularGenerators/jsonModular.generator";
import { TontoServices, createTontoServices } from "../../language-server";
import { basicDataTypes } from "../../language-server/workspace/builtins/basicDataTypes";
export type GenerateModularOptions = {
  destination?: string;
};

export const generateModularAction = async (
  dir: string,
  _opts: GenerateModularOptions
): Promise<void> => {
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

    createModel(dir, manifest, services, folderAbsolutePath);

    console.log(chalk.green("JSON File generated successfully: "));
  } catch (error) {
    console.log(chalk.red(error));
    return Promise.reject();
  }
};

async function createModel(
  dir: string,
  manifest: TontoManifest,
  services: TontoServices,
  folderAbsolutePath: string,
): Promise<void> {
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
}
