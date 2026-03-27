import * as fs from "node:fs";
import * as path from "node:path";
import {
    ErrorGufoResultResponse, GufoResultResponse, isGufoResultResponse,
    formatGufoErrorMessage, readOrCreateDefaultTontoManifest, transformToGufoCommand
} from "tonto-cli";
import * as vscode from "vscode";
import { CommandIds } from "./commandIds.js";
import {
    promptForProjectFolder,
    resolveCommandFolderFromContext,
} from "./project-location.js";

function createTransformToGufoSatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
    context.subscriptions.push(
        vscode.commands.registerCommand(CommandIds.transformTontoFromButton, createStatusBarItemValidateTontoCommand)
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(CommandIds.transformTonto, createTransformTontoToGufoCommand)
    );

    // createStatusBarItem(context, statusBarItem);
}

async function createStatusBarItemValidateTontoCommand(uri?: vscode.Uri) {
    const folderUri = await resolveCommandFolderFromContext({
        uri,
        missingContextMessage: "Failed! Could not find workspace to execute transformation",
    });

    if (folderUri) {
        await transformModel(folderUri);
    }
}

async function createTransformTontoToGufoCommand() {
    const folderUri = await promptForProjectFolder();

    if (folderUri) {
        await transformModel(folderUri);
    }
}

async function transformModel(directoryUri: vscode.Uri, label?: string, description?: string) {

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Transforming model...",
            cancellable: false,
        },
        async () => {
            try {
                const response = await transformToGufoCommand(directoryUri.fsPath, label, description);

                if (isGufoResultResponse(response)) {
                    const gufoResult = response as GufoResultResponse;
                    const manifest = readOrCreateDefaultTontoManifest(directoryUri.fsPath);
                    const folderAbsolutePath = path.resolve(directoryUri.fsPath);
                    const outFolder = path.join(folderAbsolutePath, manifest.outFolder);
                    if (!fs.existsSync(outFolder)) {
                        fs.mkdirSync(outFolder);
                    }
                    fs.writeFileSync(path.join(outFolder, "gufo.ttl"), gufoResult.result);
                    vscode.window.showInformationMessage("Generated gufo OWL file!");
                    return;
                }

                const error = response as ErrorGufoResultResponse;
                vscode.window.showErrorMessage(formatGufoErrorMessage(error));
            } catch (error) {
                const message = error instanceof Error ? error.message : "Error transforming model";
                vscode.window.showErrorMessage(message);
            }
        }
    );
}

export { createTransformToGufoSatusBarItem };
