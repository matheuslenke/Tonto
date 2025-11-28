import chalk from "chalk";
import { ErrorResultResponse, validateCommand, ValidationReturn } from "tonto-cli";
import * as vscode from "vscode";
import { CommandIds } from "./commandIds.js";

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

function createStatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
    // create a new status bar item that we can now manage
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 48);
    statusBarItem.command = CommandIds.validateTontoFromButton;
    context.subscriptions.push(statusBarItem);

    // register some listener that make sure the status bar
    // item always up-to-date
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(() => {
            updateValidationStatusBarItem(statusBarItem);
        })
    );
    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(() => {
            updateValidationStatusBarItem(statusBarItem);
        })
    );

    // update status bar item once at start
    updateValidationStatusBarItem(statusBarItem);
}

function updateValidationStatusBarItem(statusBarItem: vscode.StatusBarItem): void {
    statusBarItem.text = "$(check-all) Validate Model";
    statusBarItem.show();
}

async function createStatusBarItemValidateTontoCommand(outputChannel: vscode.OutputChannel) {
    const editor = vscode.window.activeTextEditor;
    let uri: vscode.Uri | undefined;
    const documentUri = editor?.document.uri;
    if (documentUri) {
        uri = documentUri;
    } else {
        const currentRoot = vscode.workspace.workspaceFolders?.[0]?.uri;
        if (currentRoot) {
            uri = currentRoot;
        }
    }

    if (uri) {
        try {
            const stat = await vscode.workspace.fs.stat(uri);
            if (stat.type === vscode.FileType.File) {
                uri = vscode.Uri.joinPath(uri, "..");
            }
        } catch (e) {
            // ignore
        }

        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        if (workspaceFolder) {
            await validateModel(workspaceFolder.uri, outputChannel);
        } else {
            let folderUri = uri;
            try {
                const stat = await vscode.workspace.fs.stat(uri);
                if (stat.type === vscode.FileType.File) {
                    folderUri = vscode.Uri.joinPath(uri, "..");
                }
            } catch (e) {
                // ignore
            }
            await validateModel(folderUri, outputChannel);
        }
    } else {
        vscode.window.showErrorMessage("Failed! Could not find workspace to execute validation");
    }
}

async function createValidateTontoCommand(outputChannel: vscode.OutputChannel) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    let folderUri: vscode.Uri | undefined;

    if (workspaceFolders && workspaceFolders.length > 0) {
        if (workspaceFolders.length === 1) {
            const options = [`Use Workspace Root (${workspaceFolders[0].name})`, "Select Folder..."];
            const selection = await vscode.window.showQuickPick(options, {
                placeHolder: "Select how to choose the project folder"
            });

            if (!selection) {
                return;
            }

            if (selection.startsWith("Use Workspace Root")) {
                folderUri = workspaceFolders[0].uri;
            }
        } else {
            // Multiple workspace folders
            const folderItems = workspaceFolders.map(wf => ({ label: `$(root-folder) ${wf.name}`, uri: wf.uri }));
            const options = [
                ...folderItems,
                { label: "$(folder) Select Folder...", uri: undefined }
            ];

            const selection = await vscode.window.showQuickPick(options, {
                placeHolder: "Select the workspace folder or a specific folder"
            });

            if (!selection) {
                return;
            }

            if (selection.uri) {
                folderUri = selection.uri;
            }
        }
    } else {
        // No workspace folders, force select folder
        const selection = await vscode.window.showQuickPick(["Select Folder..."], {
            placeHolder: "No workspace open. Select a folder."
        });
        if (!selection) return;
    }

    // If folderUri is still undefined (user chose "Select Folder..." or we fell through)
    if (!folderUri) {
        const directoryUri = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: "Select Tonto Project directory",
        });

        if (directoryUri && directoryUri[0]) {
            folderUri = directoryUri[0];
        }
    }

    if (folderUri) {
        await validateModel(folderUri, outputChannel);
    } else {
        vscode.window.showErrorMessage("Failed! Not a valid directory selected");
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
