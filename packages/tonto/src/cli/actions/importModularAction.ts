import { readFile } from "fs/promises";
import { Project, serializationUtils } from "ontouml-js";
import fs from "fs";
import { generateTontoFileModular } from "../TontoModularConstructors/tontoModular.constructor.js";
import chalk from "chalk";

export type ImportModularOptions = {
  destination?: string
}

export const importModularAction = async (fileName: string, opts: ImportModularOptions): Promise<void> => {
  console.log("Importing JSON!");
  const result = await importModularCommand(fileName, opts);
  if (result.success) {
    console.log(`Generated .tonto file at ${result.filePath}`);
  } else {
    console.log("Error generating .tonto");
  }
};

export const importModularCommand = async (fileName: string, opts: ImportModularOptions): Promise<ImportReturn> => {
  try {
    const data = await readFile(fileName, { encoding: "utf8" });
    // eslint-disable-next-line prefer-const
    const project: Project = serializationUtils.parse(data, true) as Project;

    /**
     * First we validate the imported model
     */
    const isValid = serializationUtils.validate(project);
    if (isValid) {
      console.log(chalk.bold("Model is valid. Proceding to generate tonto project..."));
    } else {
      console.log(chalk.red("Model is not valid. Aborting..."));
      throw new Error("Model invalid");
    }

    /**
     * Creating the directory to hold the generated files
     */
    if (!fs.existsSync(project.getName())) {
      fs.mkdirSync(project.getName());
    }

    const generatedFilePath = generateTontoFileModular(project, fileName, opts.destination);
    return {
      success: true,
      message: "Tonto file generated",
      filePath: generatedFilePath,
    } as ImportReturn;
  } catch (error) {
    console.log(chalk.red(error as string));
    const importReturn: ImportReturn = {
      message: error as string,
      success: false,
    };
    return importReturn;
  }
};

export type ImportReturn = {
  success: boolean
  message: string
  filePath?: string
}
