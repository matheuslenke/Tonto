import { glob } from "glob";
import { CompositeGeneratorNode } from "langium/generate";
import { NodeFileSystem } from "langium/node";
import * as fs from "node:fs";
import path from "path";
import { Model, builtInLibs } from "../../../language/index.js";
import { createTontoServices } from "../../../language/tonto-module.js";
import { extractAllAstNodes } from "../../cli-util.js";
import { GeneratorContext, parseProject } from "../../generators/jsonModular.generator.js";
import { ErrorGufoResultResponse, GufoResultResponse, TontoManifest, TransformTontoToGufo, createDefaultTontoManifest } from "../../main.js";

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

  const models: Model[] = await extractAllAstNodes(allFiles, services, builtInLibs, false);

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