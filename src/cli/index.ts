import colors from "colors";
import { Command } from "commander";
import { Model } from "../language-server/generated/ast";
import { TontoLanguageMetaData } from "../language-server/generated/module";
import { createTontoServices } from "../language-server/tonto-module";
import { extractAstNode } from "./cli-util";
import { generateJSONFile } from "./jsonGenerator";
import fs from "fs";
import { serializationUtils } from "ontouml-js";

export const generateAction = async (
  fileName: string,
  opts: GenerateOptions
): Promise<void> => {
  const services = createTontoServices().Tonto;
  const model = await extractAstNode<Model>(fileName, services);
  const generatedFilePath = generateJSONFile(model, fileName, opts.destination);
  console.log(
    colors.green(`JSON File generated successfully: ${generatedFilePath}`)
  );
};

export const importAction = async (
  fileName: string,
  opts: GenerateOptions
): Promise<void> => {
  // const services = createTontoServices().Tonto;
  // const model = await extractAstNode<Model>(fileName, services);
  console.log("Importando!");
  var obj = JSON.parse(fs.readFileSync(fileName, "utf8"));

  const ontoUMLModel = serializationUtils.parse(obj, false);
  console.log(ontoUMLModel.name);

  // const generatedFilePath = generateJSONFile(model, fileName, opts.destination);
  // console.log(
  //   colors.green(`JSON File generated successfully: ${generatedFilePath}`)
  // );
};

export type GenerateOptions = {
  destination?: string;
};

export default function(): void {
  const program = new Command();

  program
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .version(require("../../package.json").version);

  const fileExtensions = TontoLanguageMetaData.fileExtensions.join(", ");
  program
    .command("generate")
    .argument(
      "<file>",
      `source file (possible file extensions: ${fileExtensions})`
    )
    .option("-d, --destination <dir>", "destination directory of generating")
    .description("generates a JSON from your model to a source file")
    .action(generateAction);

  program
    .command("import")
    .argument("<file>", `source file (possible file extensions: .json)`)
    .option("-d, --destination <dir>", "destination directory of generating")
    .description("generates a tonto file from a JSON file")
    .action(importAction);

  program.parse(process.argv);
}
