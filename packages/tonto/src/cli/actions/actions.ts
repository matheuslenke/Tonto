import chalk from "chalk";
import * as fs from "node:fs";
import path from "path";
import { ErrorGufoResultResponse, GufoResultResponse } from "../requests/gufoTransform.js";
import { ErrorResultResponse, ValidationReturn } from "../requests/ontoumljsValidator.js";
import { readOrCreateDefaultTontoManifest } from "../utils/readManifest.js";
import { generateModularCommand } from "./commands/generateCommand.js";
import { isGufoResultResponse, transformToGufoCommand } from "./commands/generateGufoCommand.js";
import { ImportOptions, newImportCommand } from "./commands/importCommand.js";
import { initCommand } from "./commands/initCommand.js";
import { validateCommand } from "./commands/validateCommand.js";
import { validateCommandLocal } from "./commands/validateLocalCommand.js";


export type GenerateOptions = {
    destination?: string;
    dir?: string;
};

export type ValidateOptions = {
    local: boolean;
}

export class TontoActions {
    /**
   * This action imports a JSON File and create a Tonto Project based on it
   * @param opts An object containing options for importing
   */
    async importAction(fileName: string, dir?: ImportOptions): Promise<void> {
        console.log("Importing JSON!");
        await newImportCommand({
            fileName: fileName,
            destination: dir?.destination
        });
        // if (result.success) {
        //   console.log(`Generated .tonto file at ${result.filePath}`);
        // } else {
        //   console.log("Error generating .tonto");
        // }
    }

    async generateAction(opts: GenerateOptions): Promise<void> {
        if (opts.dir) {
            try {
                const generatedFile = await generateModularCommand(opts.dir);
                if (generatedFile) {
                    console.log(chalk.green(`JSON File generated successfully: ${generatedFile}`));
                }
            } catch (error) {
                console.log(chalk.red(error));
            }
        }

        console.error(chalk.red("Neither file or directory provided."));
    }

    async transformToGufoAction(dirName: string): Promise<void> {
        if (!dirName) {
            console.log(chalk.red("Directory not provided!"));
            return;
        }
        console.log(chalk.bold("Transforming to gufo..."));

        try {
            const manifest = readOrCreateDefaultTontoManifest(dirName);
            const response = await transformToGufoCommand(dirName);

            if (isGufoResultResponse(response)) {
                const resultResponse = response as GufoResultResponse;
                if (!fs.existsSync(dirName)) {
                    fs.mkdirSync(dirName);
                }
                fs.writeFileSync(path.join(dirName, manifest.outFolder, manifest.projectName), resultResponse.result);
            } else {
                const errorResponse = response as ErrorGufoResultResponse;
                errorResponse.info.forEach((errorInfo) => {
                    console.log(chalk.bold.redBright(`[${errorInfo.severity}] ${errorInfo.title}:`));
                    console.log(chalk.red(errorInfo.description));
                });
            }
            console.log(chalk.bold.green("Transformation to Gufo finished"));
        } catch (error) {
            console.log(chalk.red(error));
        }
    }

    async validateAction(dirName: string, opts: { withApi?: boolean }): Promise<void> {
        if (!dirName) {
            console.log(chalk.red("Directory not provided!"));
            return;
        }
        console.log(chalk.bold("Performing local validation..."));
        const diagnostics = await validateCommandLocal(dirName);
        
        if (diagnostics && diagnostics.length > 0) {
            console.log(chalk.bold(`- Total of local errors: ${diagnostics.length}`));
        } else {
            console.log(chalk.green("No local errors found."));
        }

        if (opts.withApi) {
            console.log(chalk.bold("\nPerforming API validation..."));
            try {
                const response = await validateCommand(dirName, true);

                if (Array.isArray(response)) {
                    const resultResponses = response as ValidationReturn[];
                    let errorCount = 0;
                    resultResponses.forEach(result => {
                        errorCount += result.result.length;
                        result.result.forEach(resultResponse => {
                            console.log(chalk.bold.redBright(`[${resultResponse.severity}] ${resultResponse.title}:`));
                            console.log(chalk.red(resultResponse.description));
                        });
                    });
                    console.log(chalk.bold(`- Total of API errors: ${errorCount}`));
                } else {
                    const error = response as ErrorResultResponse;
                    console.log(chalk.bold.red(error.message));
                }
            } catch (error) {
                console.log(chalk.red(error));
            }
        }
        console.log(chalk.bold.green("\nValidation finished."));
    }

    async initAction(opts: { destination?: string; template?: string }): Promise<void> {
        const cmd = initCommand();
        cmd.parse([process.argv[0], process.argv[1]]);
    }
}