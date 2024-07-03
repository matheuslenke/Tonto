import chalk from "chalk";
import * as fs from "node:fs";
import * as path from "node:path";
import {
    ErrorResultResponse,
    GufoErrorResultResponse,
    GufoResultResponse,
    ResultResponse,
    isGufoResultResponse,
    readOrCreateDefaultTontoManifest,
    transformToGufoCommand
} from "tonto-cli";
import * as vscode from "vscode";
import { CommandIds } from "./commandIds.js";

function createTransformToGufoSatusBarItem(
    context: vscode.ExtensionContext,
    statusBarItem: vscode.StatusBarItem,
    outputChannel: vscode.OutputChannel
) {
    context.subscriptions.push(
        vscode.commands.registerCommand(CommandIds.transformTontoFromButton, () => {
            createStatusBarItemValidateTontoCommand(undefined, outputChannel);
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(CommandIds.transformTonto, () => {
            createTransformTontoToGufoCommand(outputChannel);
        })
    );

    createStatusBarItem(context, statusBarItem);
}

function createStatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
    // create a new status bar item that we can now manage
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 48);
    statusBarItem.command = CommandIds.transformTontoFromButton;
    context.subscriptions.push(statusBarItem);

    // register some listener that make sure the status bar
    // item always up-to-date
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(() => {
            updateTransformToGufoStatusBarItem(statusBarItem);
        })
    );
    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(() => {
            updateTransformToGufoStatusBarItem(statusBarItem);
        })
    );

    // update status bar item once at start
    updateTransformToGufoStatusBarItem(statusBarItem);
}

function updateTransformToGufoStatusBarItem(statusBarItem: vscode.StatusBarItem): void {
    statusBarItem.text = "$(keybindings-sort) Tonto -> gUFO";
    statusBarItem.show();
}

async function createStatusBarItemValidateTontoCommand(
    uri: vscode.Uri | undefined,
    outputChannel: vscode.OutputChannel
) {
    const editor = vscode.window.activeTextEditor;
    if (!uri) {
        const documentUri = editor?.document.uri;
        if (documentUri) {
            uri = documentUri;
        } else {
            const currentRoot = vscode.workspace.workspaceFolders?.[0]?.uri;
            if (currentRoot) {
                uri = currentRoot;
            }
        }
    }

    if (uri) {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        if (workspaceFolder) {
            await transformModel(workspaceFolder.uri, outputChannel);
        } else {
            vscode.window.showErrorMessage("Failed! File needs to be in a workspace");
        }
    }
}

async function createTransformTontoToGufoCommand(outputChannel: vscode.OutputChannel) {
    const directoryUri = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select Tonto Project directory",
    });

    if (directoryUri && directoryUri[0]) {
        const selectedFolder = directoryUri[0];
        await transformModel(selectedFolder, outputChannel);
    } else {
        vscode.window.showErrorMessage("Failed! Not a valid directory selected");
    }
}

async function transformModel(directoryUri: vscode.Uri, outputChannel: vscode.OutputChannel) {
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Transforming model...",
            cancellable: false,
        },
        async () => {
            const response = await transformToGufoCommand(directoryUri.fsPath);

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
            } else {
                const error = response as GufoErrorResultResponse;
                vscode.window.showErrorMessage(error.message ?? "Error Transforming model");
                error.info.forEach((info) => {
                    outputChannel.appendLine(chalk.bold.redBright(`[${info.title}]: `));
                    outputChannel.appendLine(chalk.red(info.description));
                    outputChannel.appendLine("");
                });
                outputChannel.show();
            }
        }
    );
}

function isErrorResultResponse(
    response: void | ErrorResultResponse | ResultResponse[]
): response is ErrorResultResponse {
    return (response as ErrorResultResponse).info !== undefined;
}

export { createTransformToGufoSatusBarItem, isErrorResultResponse };
