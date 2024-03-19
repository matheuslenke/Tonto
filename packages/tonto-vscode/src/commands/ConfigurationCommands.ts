import * as vscode from "vscode";
import { CommandIds } from "./commandIds";

export function createConfigurationCommands(context: vscode.ExtensionContext){
    context.subscriptions.push(
        vscode.commands.registerCommand(CommandIds.configuration, () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'tonto');
        })
    );
}