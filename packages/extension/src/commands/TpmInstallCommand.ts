import * as vscode from "vscode";
import { CommandIds } from "./commandIds.js";
import {
    promptForProjectFolder,
    resolveCommandFolderFromContext,
} from "./project-location.js";
// import { installCommand } from "tonto-package-manager";

function createTpmInstallCommands(
    context: vscode.ExtensionContext,
    statusBarItem: vscode.StatusBarItem
) {
    context.subscriptions.push(
        vscode.commands.registerCommand(CommandIds.tpmInstallFromButton,
            createStatusBarItemTpmInstallCommand)
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(CommandIds.tpmInstall,
            createTpmInstallCommand
        )
    );

    // createStatusBarItem(context, statusBarItem);
}

async function createStatusBarItemTpmInstallCommand() {
    const folderUri = await resolveCommandFolderFromContext({
        requireWorkspaceFolder: true,
        missingContextMessage: "Failed! Could not get tonto.json file from workspace",
        missingWorkspaceMessage: "Failed! File needs to be in a workspace",
    });

    if (folderUri) {
        await tpmInstall(folderUri);
    }
}

async function createTpmInstallCommand() {
    const folderUri = await promptForProjectFolder();

    if (folderUri) {
        await tpmInstall(folderUri);
    }
}

async function tpmInstall(_: vscode.Uri) {
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Installing dependencies",
            cancellable: false,
        },
        async () => {
            // const response = await installCommand({ dir: directoryUri.path });

            // if (response.fail === false) {
            //   vscode.window.showInformationMessage("Successfully installed dependencies");
            // } else {
            //   vscode.window.showErrorMessage(`Error installing dependencies: ${response.message}`);
            // }
        }
    );
}

export { createTpmInstallCommands };
