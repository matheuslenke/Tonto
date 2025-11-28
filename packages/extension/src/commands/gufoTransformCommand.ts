import * as fs from "node:fs";
import * as path from "node:path";
import {
    ErrorGufoResultResponse, GufoResultResponse, isGufoResultResponse,
    readOrCreateDefaultTontoManifest, ResultResponse, transformToGufoCommand
} from "tonto-cli";
import * as vscode from "vscode";
import { CommandIds } from "./commandIds.js";

function createTransformToGufoSatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
    context.subscriptions.push(
        vscode.commands.registerCommand(CommandIds.transformTontoFromButton, createStatusBarItemValidateTontoCommand)
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(CommandIds.transformTonto, createTransformTontoToGufoCommand)
    );

    // createStatusBarItem(context, statusBarItem);
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

async function createStatusBarItemValidateTontoCommand(uri: vscode.Uri) {
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
        // If uri is a file, get its folder
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
            await transformModel(workspaceFolder.uri);
        } else {
            // If not in workspace, try to use the folder of the file
            let folderUri = uri;
            try {
                const stat = await vscode.workspace.fs.stat(uri);
                if (stat.type === vscode.FileType.File) {
                    folderUri = vscode.Uri.joinPath(uri, "..");
                }
            } catch (e) {
                // ignore
            }
            await transformModel(folderUri);
        }
    }
}

async function createTransformTontoToGufoCommand() {
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
            const response = await transformToGufoCommand(directoryUri.fsPath, label!, description!);

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
                const error = response as ErrorGufoResultResponse;
                const infoArray = error.info.map((info) => info.description).join("\n");
                const message = error.message ?
                    (error.message + "." + "\n" + infoArray)
                    : ("Error transforming model");
                vscode.window.showErrorMessage(message);
            }
        }
    );
}

function isErrorResultResponse(
    response: void | ErrorGufoResultResponse | ResultResponse[]
): response is ErrorGufoResultResponse {
    return (response as ErrorGufoResultResponse).info !== undefined;
}

export { createTransformToGufoSatusBarItem, isErrorResultResponse };
