import chalk from "chalk";
import * as fs from "node:fs";
import path from "path";
import { DiagnosticSeverity } from "vscode-languageserver-types";
import { ErrorGufoResultResponse, GufoResultResponse } from "../requests/gufoTransform.js";
import { ErrorResultResponse, ResultResponse } from "../requests/ontoumljsValidator.js";
import { readOrCreateDefaultTontoManifest } from "../utils/readManifest.js";
import { generateModularCommand } from "./commands/generateCommand.js";
import { isGufoResultResponse, transformToGufoCommand } from "./commands/generateGufoCommand.js";
import { ImportOptions, importCommand } from "./commands/importCommand.js";
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
    const result = await importCommand({
      fileName: fileName,
      destination: dir?.destination
    });
    if (result.success) {
      console.log(`Generated .tonto file at ${result.filePath}`);
    } else {
      console.log("Error generating .tonto");
    }
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
        fs.writeFileSync(path.join(dirName, manifest.outFolder, "gufo.ttl"), resultResponse.result);
        console.log(resultResponse.result);
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

  async validateAction(dirName: string, opts: ValidateOptions): Promise<void> {
    if (!dirName) {
      console.log(chalk.red("Directory not provided!"));
      return;
    }
    console.log(chalk.bold("Validating..."));

    if (opts.local) {
      const diagnostics = await validateCommandLocal(dirName);
      const totalValidationErrors: number = diagnostics?.filter(item => item.severity === DiagnosticSeverity.Error).length ?? -1;
      console.log(chalk.bold("- Total of errors:"), totalValidationErrors);
      // console.log(chalk.bold("# Validation Results:"));
      // diagnostics?.forEach(diagnostic => {
      //   console.log(chalk.bold(`[${diagnostic.source}][${diagnostic.tags}]`), chalk.red(diagnostic.message));
      // });
    }

    try {
      const response = await validateCommand(dirName);

      // If it is ResultResponse[]
      if (Array.isArray(response)) {
        const resultResponses = response as ResultResponse[];
        resultResponses.forEach((resultResponse) => {
          console.log(chalk.bold.redBright(`[${resultResponse.severity}] ${resultResponse.title}:`));
          console.log(chalk.red(resultResponse.description));
        });
      } else {
        const error = response as ErrorResultResponse;
        console.log(chalk.bold.red(error.message));
      }
      console.log(chalk.bold.green("Validation finished"));
    } catch (error) {
      console.log(chalk.red(error));
    }
  }
}