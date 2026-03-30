import * as vscode from "vscode";
import { getOutputChannel } from "../extension/outputChannel.js";
import { CommandIds } from "./commandIds.js";
import {
    buildGuidanceTemplateFiles,
    materializeInitProjectFiles,
    promptGuidanceTargetChoice,
    shouldIncludeTemplatePathForGuidanceTarget,
} from "./init-project-files.js";
import { getPrimaryWorkspaceFolderOrShowError } from "./project-location.js";

function createAddGuidancesCommand(context: vscode.ExtensionContext, sharedOutputChannel?: vscode.OutputChannel) {
    context.subscriptions.push(
        vscode.commands.registerCommand(CommandIds.addGuidances, () => addGuidances(context, sharedOutputChannel))
    );
}

async function addGuidances(_context: vscode.ExtensionContext, sharedOutputChannel?: vscode.OutputChannel) {
    const outputChannel = sharedOutputChannel ?? getOutputChannel();
    outputChannel.appendLine("[Tonto: Add Guidances to project] Command invoked");

    const workspaceFolder = getPrimaryWorkspaceFolderOrShowError(
        "No workspace open to add guidances.",
        outputChannel
    );
    if (!workspaceFolder) {
        return;
    }

    const guidanceTarget = await promptGuidanceTargetChoice();
    outputChannel.appendLine(`Prompt result - guidanceTarget: ${String(guidanceTarget)}`);
    if (!guidanceTarget) {
        outputChannel.appendLine("User cancelled guidance target pick");
        outputChannel.show(true);
        return;
    }

    try {
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: "Adding Tonto guidance files to project",
                cancellable: false,
            },
            async () => {
                const guidanceFiles = buildGuidanceTemplateFiles();
                await materializeInitProjectFiles(workspaceFolder.uri, guidanceFiles, {
                    outputChannel,
                    filterEntry: (_file, relativePath) =>
                        shouldIncludeTemplatePathForGuidanceTarget(guidanceTarget, relativePath),
                });

                outputChannel.appendLine(`Guidance files added to project at ${workspaceFolder.uri.fsPath}`);
                outputChannel.show(true);
                vscode.window.showInformationMessage("Tonto guidance files added to project.");
            }
        );
    } catch (error) {
        console.error(error);
    }
}

export { createAddGuidancesCommand };
