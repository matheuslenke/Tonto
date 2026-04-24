import * as path from "path";
import { formatTontoGenerationErrorMessage, importCommand } from "tonto-cli";
import * as vscode from "vscode";
import { CommandIds } from "./commandIds.js";

function createTontoGenerationStatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
    // Registering Status bar Item Command
    context.subscriptions.push(
        vscode.commands.registerCommand(CommandIds.generateTontoFromButton, createStatusBarItemGenerateTontoCommand)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(CommandIds.generateTonto, createCommandPaletteGenerateTontoCommand)
    );

    // createStatusBarItem(context, statusBarItem);
}

async function createCommandPaletteGenerateTontoCommand() {
    const fileUri = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: "Select JSON File",
    });

    if (fileUri && fileUri[0]) {
        const selectedFile = fileUri[0];

        const generatedDirectoryName = await vscode.window.showInputBox({
            prompt: "Enter the name of the directory to hold the generated model. Leave blank to use 'generated'",
            value: "generated",
        });

        if (generatedDirectoryName === undefined) {
            return;
        }

        await generateTonto(selectedFile, normalizeGeneratedDirectoryName(generatedDirectoryName));
    } else {
        vscode.window.showErrorMessage("Failed! Not a valid file selected");
    }
}

async function createStatusBarItemGenerateTontoCommand(uri: vscode.Uri) {
    const editor = vscode.window.activeTextEditor;
    if (!uri) {
        const documentUri = editor?.document.uri;
        if (documentUri) {
            uri = documentUri;
        }
    }

    if (uri) {
        await generateTonto(uri, "generated");
    }
}

async function generateTonto(uri: vscode.Uri, generatedDirectoryName: string) {
    if (uri.scheme == "file") {
        const document = await vscode.workspace.openTextDocument(uri);
        if (document.languageId === "json") {
            const destination = path.join(path.dirname(uri.fsPath), generatedDirectoryName);
            try {
                const result = await importCommand({
                    fileName: document.fileName,
                    destination: destination,
                });

                if (result.success) {
                    vscode.window.showInformationMessage(`Success! ${result.message}`);
                    return;
                }

                vscode.window.showErrorMessage(
                    result.error ? formatTontoGenerationErrorMessage(result.error) : result.message,
                    { modal: true }
                );
                console.error(result.error ?? result.message);
            } catch (error) {
                vscode.window.showErrorMessage(formatTontoGenerationErrorMessage(error), { modal: true });
                console.error(error);
            }
        } else {
            vscode.window.showErrorMessage("Failed! File is not a JSON");
        }
    }
}

function normalizeGeneratedDirectoryName(generatedDirectoryName: string): string {
    const normalizedDirectoryName = generatedDirectoryName.trim();
    return normalizedDirectoryName.length > 0 ? normalizedDirectoryName : "generated";
}

export { createTontoGenerationStatusBarItem };
