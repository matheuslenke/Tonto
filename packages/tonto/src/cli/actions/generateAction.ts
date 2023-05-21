import { extractAstNode } from "../cli-util";
import { generateJSONFile } from "../jsonGenerator";
import { NodeFileSystem } from "langium/node";
import { createTontoServices, Model } from "../../language-server";
import chalk from "chalk";

export type GenerateOptions = {
  destination?: string;
};

export const generateAction = async (
  fileName: string,
  opts: GenerateOptions
): Promise<void> => {
  const generatedFilePath = generateCommand(fileName, opts);
  console.log(
    chalk.green(`JSON File generated successfully: ${generatedFilePath}`)
  );
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
