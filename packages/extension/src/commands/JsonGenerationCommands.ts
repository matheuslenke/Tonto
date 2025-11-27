import { generateModularCommand } from "tonto-cli";
import * as vscode from "vscode";
import { CommandIds } from "./commandIds.js";

function createGenerateJsonStatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
    // Register the status bar item command
    context.subscriptions.push(
        vscode.commands.registerCommand(CommandIds.generateJsonFromButton, createStatusBarItemGenerateJsonCommand)
    );

    // Register the command pallete command
    context.subscriptions.push(

        vscode.commands.registerCommand(CommandIds.generateJson, createCommandPaletteGenerateJsonCommand)
    );

    // return createStatusBarItem(context, statusBarItem);
}

function createStatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
    // create a new status bar item that we can now manage
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = CommandIds.generateJsonFromButton;
    context.subscriptions.push(statusBarItem);

    // register some listener that make sure the status bar
    // item always up-to-date
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(() => {
            updateJsonStatusBarItem(statusBarItem);
        })
    );
    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(() => {
            updateJsonStatusBarItem(statusBarItem);
        })
    );

    // update status bar item once at start
    updateJsonStatusBarItem(statusBarItem);

    return statusBarItem;
}

function updateJsonStatusBarItem(statusBarItem: vscode.StatusBarItem): void {
    statusBarItem.text = "$(bracket-dot) Tonto -> JSON";
    statusBarItem.show();
}

async function generateJson(folderUri: vscode.Uri, label?: string, description?: string) {
    if (!label || !description) {
        const projectDetails = await getProjectDetails(folderUri);
        if (!projectDetails) {
            return;
        }
        label = projectDetails.label;
        description = projectDetails.description;
    }

    try {
        const generatedFileName = await generateModularCommand(folderUri.fsPath, label, description);
        if (generatedFileName) {
            vscode.window.showInformationMessage(`JSON File generated successfully with name "${generatedFileName}"`);
        }
    } catch (error) {
        vscode.window.showErrorMessage("Could not generate JSON.");
        console.error(error);
    }
}

async function getProjectDetails(folderUri: vscode.Uri): Promise<{ label: string, description: string } | undefined> {
    const tontoFileUri = vscode.Uri.joinPath(folderUri, "tonto.json");
    try {
        const document = await vscode.workspace.openTextDocument(tontoFileUri);
        const fileContent = document.getText();
        const manifest = JSON.parse(fileContent);
        if (manifest.projectName && manifest.description) {
            return {
                label: manifest.projectName,
                description: manifest.description
            };
        } else {
            console.warn("tonto.json found but missing projectName or description", manifest);
        }
    } catch (error) {
        console.error("Error reading tonto.json at", tontoFileUri.fsPath, error);
    }

    const create = await vscode.window.showInformationMessage(
        `tonto.json not found in ${folderUri.fsPath}. Do you want to create one?`,
        "Yes",
        "No"
    );

    if (create !== "Yes") {
        return undefined;
    }

    const label = await vscode.window.showInputBox({
        prompt: "Enter the project label",
        placeHolder: "Project Name",
    });

    if (label === undefined) {
        return undefined; // User cancelled
    }

    const description = await vscode.window.showInputBox({
        prompt: "Enter the project description",
        placeHolder: "Description...",
    });

    if (description === undefined) {
        return undefined; // User cancelled
    }

    // Create tonto.json
    const tontoJsonContent = {
        projectName: label,
        description: description,
        outFolder: "out",
        tontoFile: "main.tonto"
    };

    await vscode.workspace.fs.writeFile(
        tontoFileUri,
        new TextEncoder().encode(JSON.stringify(tontoJsonContent, null, 4))
    );

    return { label, description };
}

async function createCommandPaletteGenerateJsonCommand() {
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
        await generateJson(folderUri);
    }
}

async function createStatusBarItemGenerateJsonCommand(uri: vscode.Uri) {
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

        // If we can't determine a folder, fallback to workspace root or ask
        // But for status bar, we usually have a context. 
        // Let's just try to use the uri as the folder if it's a folder, or parent if file.

        // Actually, the original code did:
        // const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        // if (workspaceFolder) { await generateJson(workspaceFolder); }

        // We should probably stick to that logic but use our new generateJson which takes a Uri, not WorkspaceFolder
        // But wait, generateJson now expects a folder Uri.

        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        if (workspaceFolder) {
            await generateJson(workspaceFolder.uri);
        } else {
            // If not in workspace, maybe just use the folder of the file?
            // The original code required it to be in a workspace.
            // Let's keep it simple and consistent with original behavior for now, 
            // but using the new generateJson signature.
            // However, if the user clicks the button, they might expect it to work on the current file's project.

            // Let's try to find the folder of the current file
            let folderUri = uri;
            const stat = await vscode.workspace.fs.stat(uri);
            if (stat.type === vscode.FileType.File) {
                folderUri = vscode.Uri.joinPath(uri, "..");
            }
            await generateJson(folderUri);
        }
    }
}

export { createGenerateJsonStatusBarItem };
