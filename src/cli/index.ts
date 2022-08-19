import colors from "colors";
import { Command } from "commander";
import { Model } from "../language-server/generated/ast";
import { TontoLanguageMetaData } from "../language-server/generated/module";
import { createTontoServices } from "../language-server/tonto-module";
import { extractAstNode } from "./cli-util";
import { generateJSONFile } from "./jsonGenerator";
import { readFile } from "fs/promises";
import { OntoumlElement, serializationUtils } from "ontouml-js";
import { generateTontoFile } from "./tontoGenerator";

export const generateAction = async (
  fileName: string,
  opts: GenerateOptions
): Promise<void> => {
  console.log(opts);
  const services = createTontoServices().Tonto;
  const model = await extractAstNode<Model>(fileName, services);
  const generatedFilePath = generateJSONFile(model, fileName, opts.destination);
  console.log(
    colors.green(`JSON File generated successfully: ${generatedFilePath}`)
  );
};

interface JsonElement {
  model?: any;
  diagrams?: any;
  type: string;
  id: string;
  name: string;
  description?: string;
}

export const importAction = async (
  fileName: string,
  opts: GenerateOptions
): Promise<void> => {
  console.log("Importing JSON!");
  try {
    let data = await readFile(fileName, { encoding: "utf8" });
    let obj: JsonElement[] = JSON.parse(data);
    let ontoumlElements: OntoumlElement[] = [];

    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        const ontoUMLModel = serializationUtils.parse(
          JSON.stringify(item),
          false
        );

        ontoumlElements.push(ontoUMLModel);
      });
    } else {
      const element: JsonElement = obj;
      const ontoUMLModel = serializationUtils.parse(
        JSON.stringify(element),
        false
      );
      ontoumlElements.push(ontoUMLModel);
    }
    console.log(opts);
    const generatedFilePath = generateTontoFile(
      ontoumlElements,
      fileName,
      opts.destination
    );
    console.log(
      colors.green(`JSON File generated successfully: ${generatedFilePath}`)
    );
  } catch (error) {
    console.log(error);
  }
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
    .argument("<file>", `source file (possible file extensions: json)`)
    .option("-d, --destination <dir>", "destination directory of generating")
    .description("generates a tonto file from a JSON file")
    .action(importAction);

  program.parse(process.argv);
}
