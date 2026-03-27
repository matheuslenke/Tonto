import { generateModularCommand } from "tonto-cli";
import * as vscode from "vscode";
import { CommandIds } from "./commandIds.js";
import {
    promptForProjectFolder,
    resolveCommandFolderFromContext,
} from "./project-location.js";

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

async function generateJson(folderUri: vscode.Uri) {
    try {
        const generatedFileName = await generateModularCommand(folderUri.fsPath);
        if (generatedFileName) {
            vscode.window.showInformationMessage(`JSON File generated successfully with name "${generatedFileName}"`);
        }
    } catch (error) {
        vscode.window.showErrorMessage("Could not generate JSON.");
        console.error(error);
    }
}

async function createCommandPaletteGenerateJsonCommand() {
    const folderUri = await promptForProjectFolder();

    if (folderUri) {
        await generateJson(folderUri);
    }
}

async function createStatusBarItemGenerateJsonCommand(uri?: vscode.Uri) {
    const folderUri = await resolveCommandFolderFromContext({
        uri,
        missingContextMessage: "Failed! Could not find a folder to generate JSON from",
    });

    if (folderUri) {
        await generateJson(folderUri);
    }
}

export { createGenerateJsonStatusBarItem };
