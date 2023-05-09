import chalk from "chalk";
import fs from "fs";
import { NodeFileSystem } from "langium/node";
import path from "path";
import {
  TontoServices,
  createTontoServices,
} from "../../language-server/tonto-module";
import { MultilingualText, Package, Project } from "ontouml-js";
import { Model } from "../../language-server/generated/ast";
import { extractAllAstNodes, extractAstNode } from "../cli-util";
import { TontoManifest } from "../model/TontoManifest";
import { glob } from "glob";

export type GenerateOptions = {
  destination?: string;
};

export const generateModularAction = async (
  dir: string,
  _opts: GenerateOptions
): Promise<void> => {
  const services = createTontoServices({ ...NodeFileSystem }).Tonto;

  // Find tonto.json file
  const tontoManifest = fs.readdirSync(dir).includes("tonto.json");

  if (tontoManifest === undefined) {
    console.log(chalk.red("tonto.json not found!"));
    return Promise.reject();
  }
  const filePath = path.join(dir, "tonto.json");
  const tontoManifestContent = fs.readFileSync(filePath, "utf-8");

  const manifest: TontoManifest = JSON.parse(tontoManifestContent);

  const project = new Project({
    name: new MultilingualText(manifest.name),
  });
  const rootPackage = project.createModel({
    name: new MultilingualText(manifest.name),
  });

  const allFiles = await glob(dir + "/**/*.tonto");
  // Load workspace with all built in libraries
  // services.shared.workspace.WorkspaceManager.initializeWorkspace();

  const models: Model[] = await extractAllAstNodes(allFiles, services);

  for (const model of models) {
    console.log(model.module.name);
  }

  await walkSync(dir, services, rootPackage);
  console.log(chalk.green("JSON File generated successfully: "));
};

async function createModel(
  filePath: string,
  services: TontoServices,
  rootPackage: Package
): Promise<void> {
  const extName = path.extname(filePath);
  if (extName === ".tonto") {
    console.debug("Leu o modelo: ", filePath);
    const model = await extractAstNode<Model>(filePath, services);
    rootPackage.createPackage(model.module.name);
  }
}

async function walkSync(
  currentDirPath: string,
  services: TontoServices,
  rootPackage: Package
) {
  const files = fs.readdirSync(currentDirPath);
  for (const file of files) {
    const filePath = path.join(currentDirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      await createModel(filePath, services, rootPackage);
    } else if (stat.isDirectory()) {
      walkSync(filePath, services, rootPackage);
    }
  }
}
