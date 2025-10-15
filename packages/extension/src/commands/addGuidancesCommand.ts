import * as path from 'path';
import * as vscode from 'vscode';
import { buildInitProjectFiles, InitProjectFile } from '../../../tonto/src/cli/actions/commands/initCommand.js';
import { getOutputChannel } from '../extension/outputChannel.js';
import { CommandIds } from './commandIds.js';

function createAddGuidancesCommand(context: vscode.ExtensionContext, sharedOutputChannel?: vscode.OutputChannel) {
    context.subscriptions.push(vscode.commands.registerCommand(CommandIds.addGuidances, () => addGuidances(context, sharedOutputChannel)));
}

async function addGuidances(ontext: vscode.ExtensionContext, sharedOutputChannel?: vscode.OutputChannel) {
        const oc = sharedOutputChannel ?? getOutputChannel();
        oc.appendLine('[Tonto: Add Guidances to project] Command invoked');

        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            oc.appendLine('No workspace open');
            vscode.window.showErrorMessage('No workspace open to add guidances.');
            oc.show(true);
            return;
        }

        const workspaceFolder = vscode.workspace.workspaceFolders[0];

        const editorPick = await promptEditorChoice(oc);
        if (!editorPick) {
            oc.appendLine('User cancelled editor pick');
            oc.show(true);
            return;
        }

        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Adding Tonto guidance files to project',
                cancellable: false
            }, async () => {
                const guidanceFiles = generateGuidanceFiles(oc);
                await createGuidanceDirectories(guidanceFiles, workspaceFolder, oc);
                await createGuidanceFilesOnDisk(guidanceFiles, workspaceFolder, editorPick, oc);

                oc.appendLine(`Guidance files added to project at ${workspaceFolder.uri.fsPath}`);
                oc.show(true);
                vscode.window.showInformationMessage('Tonto guidance files added to project.');
                return;
            });
        } catch (err) {
            console.error(err);
        }
    }

// Helper: prompt user for editor choice
async function promptEditorChoice(oc: vscode.OutputChannel): Promise<string | undefined> {
    return await vscode.window.showQuickPick(['Cursor', 'VS Code', 'Both'], { placeHolder: 'Which editor do you use?' });
}

// Helper: generate guidance files using initCommand builder
function generateGuidanceFiles(oc: vscode.OutputChannel) {
    // Use a temporary project name so buildInitProjectFiles returns guidance files
    const tempProjectName = 'tonto-guidances-temp';
    const options: { catDogExample?: boolean } = { catDogExample: false };
    const files = buildInitProjectFiles(tempProjectName, options);

    // Filter only guidance-related entries (.cursor/rules and .github/instructions)
    const guidanceFiles = files.filter(f => f.relativePath.includes(path.join(tempProjectName, '.cursor')) || f.relativePath.includes(path.join(tempProjectName, '.github')));
    return guidanceFiles;
}

// Helper: create directories for guidance files
async function createGuidanceDirectories(guidanceFiles: Array<InitProjectFile>, workspaceFolder: vscode.WorkspaceFolder, oc: vscode.OutputChannel) {
    for (const f of guidanceFiles.filter(x => x.type === 'dir')) {
        const parts = f.relativePath.split(path.sep);
        const rel = path.join(...parts.slice(1));
        const dirPath = path.join(workspaceFolder.uri.fsPath, rel);
        const uri = vscode.Uri.file(dirPath);
        try {
            await vscode.workspace.fs.createDirectory(uri);
        } catch (err) {
            oc.appendLine(`Failed creating directory ${dirPath}: ${String(err)}`);
            oc.show(true);
            throw err;
        }
    }
}

// Helper: create files for guidance files
async function createGuidanceFilesOnDisk(guidanceFiles: Array<InitProjectFile>, workspaceFolder: vscode.WorkspaceFolder, editorPick: string, oc: vscode.OutputChannel) {
    for (const f of guidanceFiles.filter(x => x.type === 'file')) {
        const parts = f.relativePath.split(path.sep);
        const rel = path.join(...parts.slice(1));
        const filePath = path.join(workspaceFolder.uri.fsPath, rel);
        const uri = vscode.Uri.file(filePath);
        const content = f.content ?? '';
        // Respect editor choice: if Cursor only, skip .github files; if VS Code only, skip .cursor files
        if (editorPick === 'Cursor' && rel.includes('.github')) {
            continue;
        }
        if (editorPick === 'VS Code' && rel.includes('.cursor')) {
            continue;
        }
        try {
            await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(content));
        } catch (err) {
            oc.appendLine(`Failed writing file ${filePath}: ${String(err)}`);
            oc.show(true);
            throw err;
        }
    }
}

export { createAddGuidancesCommand };


