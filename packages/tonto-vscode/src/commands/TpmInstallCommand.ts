import * as vscode from "vscode";
import { CommandIds } from "./commandIds.js";
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

  createStatusBarItem(context, statusBarItem);
}

function createStatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
  // create a new status bar item that we can now manage
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 48);
  statusBarItem.command = CommandIds.tpmInstallFromButton;
  context.subscriptions.push(statusBarItem);

  // register some listener that make sure the status bar
  // item always up-to-date
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      updateTpmInstallStatusBarItem(statusBarItem);
    })
  );
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(() => {
      updateTpmInstallStatusBarItem(statusBarItem);
    })
  );

  // update status bar item once at start
  updateTpmInstallStatusBarItem(statusBarItem);
}

function updateTpmInstallStatusBarItem(statusBarItem: vscode.StatusBarItem): void {
  statusBarItem.text = "$(sync) TPM Install";
  statusBarItem.show();
}

async function createStatusBarItemTpmInstallCommand() {
  const editor = vscode.window.activeTextEditor;
  let uri: vscode.Uri | undefined;
  const documentUri = editor?.document.uri;
  if (documentUri) {
    uri = documentUri;
  } else {
    const currentRoot = vscode.workspace.workspaceFolders?.[0]?.uri;
    if (currentRoot) {
      uri = currentRoot;
    }
  }

  if (uri) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (workspaceFolder) {
      await tpmInstall(workspaceFolder.uri);
    } else {
      vscode.window.showErrorMessage("Failed! File needs to be in a workspace");
    }
  } else {
    vscode.window.showErrorMessage("Failed! Could not get tonto.json file from workspace");
  }
}

async function createTpmInstallCommand() {
  const directoryUri = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: "Select Tonto Project directory",
  });

  if (directoryUri && directoryUri[0]) {
    const selectedFolder = directoryUri[0];
    await tpmInstall(selectedFolder);
  } else {
    vscode.window.showErrorMessage("Failed! Not a valid directory selected");
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
