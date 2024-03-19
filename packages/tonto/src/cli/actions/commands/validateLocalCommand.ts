
import { glob } from "glob";
import { NodeFileSystem } from "langium/node";
import * as fs from "node:fs";
import path from "node:path";
import { Diagnostic } from "vscode-languageserver-types";
import { builtInLibs, createTontoServices } from "../../../index.js";
import { extractAllValidationErrors } from "../../cli-util.js";
import { TontoManifest, createDefaultTontoManifest } from "../../main.js";

export const validateCommandLocal = async (dirName: string): Promise<Diagnostic[] | undefined> => {
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
    return undefined;
  }

  const allFiles = await glob(dirName + "/**/*.tonto");

  // This uses Tonto Local checks
  const errors: Diagnostic[] = await extractAllValidationErrors(allFiles, services, builtInLibs);

  return errors;
};
