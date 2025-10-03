import * as path from 'path';
import * as vscode from 'vscode';
import { buildInitProjectFiles } from '../../../tonto/src/cli/actions/commands/initCommand.js';
import { getOutputChannel } from '../extension/outputChannel.js';
import { CommandIds } from './commandIds.js';

function createInitCommand(context: vscode.ExtensionContext, sharedOutputChannel?: vscode.OutputChannel) {
    context.subscriptions.push(vscode.commands.registerCommand(CommandIds.initProject, () => initAction(context, sharedOutputChannel)));
}

async function initAction(context: vscode.ExtensionContext, sharedOutputChannel?: vscode.OutputChannel) {
  const oc = sharedOutputChannel ?? getOutputChannel();
  oc.appendLine('[Tonto: Init new project command] Init command invoked');
  if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
      oc.appendLine('No workspace open');
      vscode.window.showErrorMessage('No workspace open to initialize project.');
      oc.show(true);
      return;
  }

  const workspaceFolder = vscode.workspace.workspaceFolders[0];
  oc.appendLine(`Workspace root: ${workspaceFolder.uri.fsPath}`);

  // Prompt the user for fields
  const projectName = await vscode.window.showInputBox({ prompt: 'Project name', value: 'tonto-project', validateInput: v => v && v.trim() ? undefined : 'Enter a project name' });
  oc.appendLine(`Prompt result - projectName: ${String(projectName)}`);
  if (!projectName) {
      oc.appendLine('User cancelled projectName input');
      oc.show(true);
      return;
  }
  const version = await vscode.window.showInputBox({ prompt: 'Version', value: '0.0.1' });
  oc.appendLine(`Prompt result - version: ${String(version)}`);
  if (version === undefined) {
      oc.appendLine('User cancelled version input');
      oc.show(true);
      return;
  }
  const description = await vscode.window.showInputBox({ prompt: 'Description', value: 'A new Tonto project.' });
  oc.appendLine(`Prompt result - description: ${String(description)}`);
  if (description === undefined) {
      oc.appendLine('User cancelled description input');
      oc.show(true);
      return;
  }
  const author = await vscode.window.showInputBox({ prompt: 'Author', value: '' });
  oc.appendLine(`Prompt result - author: ${String(author)}`);
  if (author === undefined) {
      oc.appendLine('User cancelled author input');
      oc.show(true);
      return;
  }
  const editorPick = await vscode.window.showQuickPick(['Cursor', 'VS Code', 'Both'], { placeHolder: 'Which editor do you use?' });
  oc.appendLine(`Prompt result - editorPick: ${String(editorPick)}`);
  if (!editorPick) {
      oc.appendLine('User cancelled editor pick');
      oc.show(true);
      return;
  }
  const templatePick = await vscode.window.showQuickPick(['Blank', 'Cat and Dog example'], { placeHolder: 'Choose a project template' });
  oc.appendLine(`Prompt result - templatePick: ${String(templatePick)}`);
  if (!templatePick) {
      oc.appendLine('User cancelled template pick');
      oc.show(true);
      return;
  }

  // Prompt for target folder at the end: offer workspace root or allow choosing a folder
  const defaultRoot = workspaceFolder.uri.fsPath;
  const folderChoice = await vscode.window.showQuickPick([defaultRoot, 'Choose a folder...'], { placeHolder: 'Select folder to generate the project in' });
  oc.appendLine(`Prompt result - folderChoice: ${String(folderChoice)}`);
  if (!folderChoice) {
      oc.appendLine('User cancelled folder choice');
      oc.show(true);
      return;
  }
  let root = defaultRoot;
  if (folderChoice === 'Choose a folder...') {
      const picked = await vscode.window.showOpenDialog({
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false,
          defaultUri: workspaceFolder.uri,
          openLabel: 'Select target folder'
      });
      if (!picked || !picked[0]) {
          oc.appendLine('User cancelled folder picker');
          oc.show(true);
          return;
      }
      root = picked[0].fsPath;
      oc.appendLine(`User picked folder: ${root}`);
  } else {
      root = folderChoice;
      oc.appendLine(`Using folder: ${root}`);
  }

  try {
      await vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: 'Initializing Tonto project',
          cancellable: false
      }, () => {
          return new Promise<void>((resolve, reject) => {
              const options: { catDogExample?: boolean } = { catDogExample: templatePick === 'Cat and Dog example' };
              oc.appendLine(`Building file list for projectName='${projectName}' options=${JSON.stringify(options)}`);
              const files = buildInitProjectFiles(projectName, options);
              oc.appendLine(`Files to create: ${files.length}`);

              // Create directories first
              (async () => {
                  for (const f of files.filter(x => x.type === 'dir')) {
                      const dirPath = path.join(root, f.relativePath);
                      const uri = vscode.Uri.file(dirPath);
                      try {
                          await vscode.workspace.fs.createDirectory(uri);
                          oc.appendLine(`Created directory: ${dirPath}`);
                      } catch (err) {
                          oc.appendLine(`Failed creating directory ${dirPath}: ${String(err)}`);
                          oc.show(true);
                          reject(err);
                          return;
                      }
                  }

                  // Create files
                  for (const f of files.filter(x => x.type === 'file')) {
                      const filePath = path.join(root, f.relativePath);
                      const uri = vscode.Uri.file(filePath);
                      const content = f.content ?? '';
                      try {
                          await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(content));
                          oc.appendLine(`Wrote file: ${filePath}`);
                      } catch (err) {
                          oc.appendLine(`Failed writing file ${filePath}: ${String(err)}`);
                          oc.show(true);
                          reject(err);
                          return;
                      }
                  }

                  oc.appendLine(`All files created for project '${projectName}' at ${root}`);
                  oc.show(true);
                  vscode.window.showInformationMessage('Tonto project initialized successfully.');
                  resolve();
                  // After creation, ask user if they want to open the project
                  (async () => {
                      try {
                          const openPick = await vscode.window.showQuickPick(['Open in current window', 'Open in new window', "Don't open"], { placeHolder: 'Open the generated project now?' });
                          oc.appendLine(`Prompt result - openPick: ${String(openPick)}`);
                          if (!openPick) {
                              oc.appendLine('User cancelled open-project prompt');
                              return;
                          }

                          const projectPath = path.resolve(root, projectName)

                          if (openPick === 'Open in current window') {
                              // Open the folder in the current window
                              await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath), false);
                              oc.appendLine('Opened project in current window');
                          } else if (openPick === 'Open in new window') {
                              // Open the folder in a new window
                              await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath), true);
                              oc.appendLine('Opened project in new window');
                          } else {
                              oc.appendLine('User chose not to open the project');
                          }
                      } catch (err) {
                          oc.appendLine(`Error while opening project: ${String(err)}`);
                      }
                  })();
              })();
          });
      });
  } catch (err) {
      console.error(err);
  }
}
export { createInitCommand };


