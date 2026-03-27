import chalk from "chalk";
import { ErrorResultResponse, validateCommand, ValidationReturn } from "tonto-cli";
import * as vscode from "vscode";
import { CommandIds } from "./commandIds.js";
import {
    promptForProjectFolder,
    resolveCommandFolderFromContext,
} from "./project-location.js";

function createValidationSatusBarItem(
    context: vscode.ExtensionContext,
    statusBarItem: vscode.StatusBarItem,
    outputChannel: vscode.OutputChannel
) {
    context.subscriptions.push(
        vscode.commands.registerCommand(CommandIds.validateTontoFromButton, () => {
            createStatusBarItemValidateTontoCommand(outputChannel);
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(CommandIds.validateTonto, () => {
            createValidateTontoCommand(outputChannel);
        })
    );

    // createStatusBarItem(context, statusBarItem);
}

async function createStatusBarItemValidateTontoCommand(outputChannel: vscode.OutputChannel, uri?: vscode.Uri) {
    const folderUri = await resolveCommandFolderFromContext({
        uri,
        missingContextMessage: "Failed! Could not find workspace to execute validation",
    });

    if (folderUri) {
        await validateModel(folderUri, outputChannel);
    }
}

async function createValidateTontoCommand(outputChannel: vscode.OutputChannel) {
    const folderUri = await promptForProjectFolder();

    if (folderUri) {
        await validateModel(folderUri, outputChannel);
    }
}

async function validateModel(directoryUri: vscode.Uri, outputChannel: vscode.OutputChannel) {
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Validating model...",
            cancellable: false,
        },
        async () => {
            const response: ValidationReturn | ErrorResultResponse = await validateCommand(directoryUri.fsPath);

            if (isValidationReturn(response)) {
                outputChannel.clear();
                if (response.result.length === 0) {
                    vscode.window.showInformationMessage("Validation successful! No errors found.");
                } else {
                    response.result.forEach((resultResponse) => {
                        outputChannel.appendLine(chalk.bold.redBright(`[${resultResponse.severity}] ${resultResponse.title}:`));
                        outputChannel.appendLine(chalk.red(resultResponse.description));
                    });
                    outputChannel.show();
                }
            } else {
                const error = response as ErrorResultResponse;
                vscode.window.showErrorMessage(error.message ?? "Error validating model");
            }
        }
    );
}

function isValidationReturn(object: unknown): object is ValidationReturn {
    return typeof object === "object" && object !== null && "result" in (object as Record<string, unknown>);
}

export { createValidationSatusBarItem };
