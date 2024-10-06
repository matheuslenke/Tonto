import chalk from "chalk";

import * as fs from "node:fs";
import path from "node:path";
import { Project, serializationUtils } from "ontouml-js";
import { generateTontoFile } from "../../constructors/index.js";
import { TontoProject } from "../../model/grammar/ProjectItem.js";

export type ImportOptions = {
    fileName: string;
    destination?: string
}

export type ImportReturn = {
    success: boolean
    message: string
    filePath?: string
}

export const importCommand = async (opts: ImportOptions): Promise<ImportReturn> => {
    try {
        const data = fs.readFileSync(opts.fileName, { encoding: "utf8" });

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
        if (!fs.existsSync(opts.destination ?? "generated")) {
            fs.mkdirSync(opts.destination ?? "generated");
        }
        const projectPath = path.join(opts.destination ?? "generated", project.getNameOrId());
        if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath);
        }

        const generatedFilePath = generateTontoFile(project, opts.fileName, opts.destination);
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

export const newImportCommand = async (opts: ImportOptions): Promise<void> => {
    const data = fs.readFileSync(opts.fileName, { encoding: "utf8" });

    const project: Project = serializationUtils.parse(data, true) as Project;

    /**
   * First we validate if the imported model is valid
   */
    const isValid = serializationUtils.validate(project);
    if (isValid) {
        console.log(chalk.bold("Model is valid. Proceding to generate tonto project..."));
    } else {
        console.log(chalk.red("Model is not valid. Aborting..."));
        throw new Error("Model invalid");
    }

    const tontoProject = new TontoProject(project,
        opts.fileName,
        opts.destination ?? "generated");

    tontoProject.writeProject(opts.destination ?? "./generated");
};