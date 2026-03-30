import * as vscode from "vscode";
import { getOutputChannel } from "../extension/outputChannel.js";
import { CommandIds } from "./commandIds.js";
import { materializeInitProjectFiles } from "./init-project-files.js";
import { getPrimaryWorkspaceFolderOrShowError } from "./project-location.js";
import {
    buildSkillTemplateFiles,
    promptSkillTargetChoice,
    shouldIncludeTemplatePathForSkillTarget,
} from "./skill-project-files.js";

function createAddSkillCommand(context: vscode.ExtensionContext, sharedOutputChannel?: vscode.OutputChannel) {
    context.subscriptions.push(
        vscode.commands.registerCommand(CommandIds.addSkill, () => addSkill(context, sharedOutputChannel))
    );
}

async function addSkill(_context: vscode.ExtensionContext, sharedOutputChannel?: vscode.OutputChannel) {
    const outputChannel = sharedOutputChannel ?? getOutputChannel();
    outputChannel.appendLine("[Tonto: Add Tonto skill to project] Command invoked");

    const workspaceFolder = getPrimaryWorkspaceFolderOrShowError(
        "No workspace open to add the Tonto skill.",
        outputChannel
    );
    if (!workspaceFolder) {
        return;
    }

    const skillTarget = await promptSkillTargetChoice();
    outputChannel.appendLine(`Prompt result - skillTarget: ${String(skillTarget)}`);
    if (!skillTarget) {
        outputChannel.appendLine("User cancelled skill target pick");
        outputChannel.show(true);
        return;
    }

    try {
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: "Adding Tonto skill to project",
                cancellable: false,
            },
            async () => {
                const skillFiles = buildSkillTemplateFiles();
                await materializeInitProjectFiles(workspaceFolder.uri, skillFiles, {
                    outputChannel,
                    filterEntry: (_file, relativePath) =>
                        shouldIncludeTemplatePathForSkillTarget(skillTarget, relativePath),
                });

                outputChannel.appendLine(`Tonto skill added to project at ${workspaceFolder.uri.fsPath}`);
                outputChannel.show(true);
                vscode.window.showInformationMessage("Tonto skill added to project.");
            }
        );
    } catch (error) {
        console.error(error);
    }
}

export { createAddSkillCommand };
