import { generateModularCommand } from "tonto-cli/src/cli/actions";
import * as vscode from "vscode";
import { CommandIds } from "./commandIds";

function createGenerateJsonStatusBarItem(
  context: vscode.ExtensionContext,
  statusBarItem: vscode.StatusBarItem
) {
  // Register the status bar item command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      CommandIds.generateJsonFromButton,
      createStatusBarItemGenerateJsonCommand
    )
  );

  // Register the command pallete command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      CommandIds.generateJson,
      createCommandPaletteGenerateJsonCommand
    )
  );

  return createStatusBarItem(context, statusBarItem);
}

function createStatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
  // create a new status bar item that we can now manage
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = CommandIds.generateJsonFromButton;
  context.subscriptions.push(statusBarItem);

  // register some listener that make sure the status bar
  // item always up-to-date
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => { updateJsonStatusBarItem(statusBarItem); })
  );
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(() => { updateJsonStatusBarItem(statusBarItem); })
  );

  // update status bar item once at start
  updateJsonStatusBarItem(statusBarItem);

  return statusBarItem;
}

function updateJsonStatusBarItem(statusBarItem: vscode.StatusBarItem): void {
  statusBarItem.text = "$(bracket-dot) Generate JSON from Model";
  statusBarItem.show();
}

async function generateJson(workspaceFolder: vscode.WorkspaceFolder) {
  const filePattern = workspaceFolder.uri.path + "tonto.json";
  // const destination = path.join(workspaceFolder.uri.path, "generated");
  vscode.workspace.findFiles(filePattern).then(async (_) => {
    const generatedFileName = await generateModularCommand(workspaceFolder.uri.path);
    if (generatedFileName) {
      vscode.window.showInformationMessage(`JSON File generated successfully with name "${generatedFileName}"`);
    }
  });
}

async function createCommandPaletteGenerateJsonCommand() {
  const directoryUri = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: "Select Tonto Project directory"
  });

  if (directoryUri && directoryUri[0]) {
    const selectedFolder = directoryUri[0];
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(selectedFolder);
    if (workspaceFolder) {
      await generateJson(workspaceFolder);
    } else {
      vscode.window.showErrorMessage("Failed! Project needs to be in a workspace");
    }
  } else {
    vscode.window.showErrorMessage("Failed! Not a valid directory selected");
  }
}

async function createStatusBarItemGenerateJsonCommand(uri: vscode.Uri) {
  const editor = vscode.window.activeTextEditor;
  if (!uri) {
    const documentUri = editor?.document.uri;
    if (documentUri) {
      uri = documentUri;
    }
  }

  if (uri) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (workspaceFolder) {
      await generateJson(workspaceFolder);
    } else {
      vscode.window.showErrorMessage("Failed! File needs to be in a workspace");
    }
  }
}

export { createGenerateJsonStatusBarItem };