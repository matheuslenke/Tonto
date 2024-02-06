import * as path from "path";
import { importModularCommand } from "tonto-cli";
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

  createStatusBarItem(context, statusBarItem);
}

function createStatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
  // create a new status bar item that we can now manage
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 49);
  statusBarItem.command = CommandIds.generateTontoFromButton;
  context.subscriptions.push(statusBarItem);

  // register some listener that make sure the status bar
  // item always up-to-date
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => updateTontoStatusBarItem(statusBarItem)));
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(() => updateTontoStatusBarItem(statusBarItem))
  );

  // update status bar item once at start
  updateTontoStatusBarItem(statusBarItem);
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
      prompt: "Enter the name of the directory to hold the generated model",
      value: "generated",
    });
    if (generatedDirectoryName) {
      await generateTonto(selectedFile, generatedDirectoryName);
    } else {
      vscode.window.showErrorMessage("Failed! Not a valid name provided for directory");
    }
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

function updateTontoStatusBarItem(statusBarItem: vscode.StatusBarItem): void {
  statusBarItem.text = "$(keybindings-sort) JSON -> Tonto";
  statusBarItem.show();
}

async function generateTonto(uri: vscode.Uri, generatedDirectoryName: string) {
  if (uri.scheme == "file") {
    vscode.workspace.openTextDocument(uri).then(async (document) => {
      if (document.languageId === "json") {
        const destination = path.join(path.dirname(uri.fsPath), generatedDirectoryName);
        const result = await importModularCommand(document.fileName, {
          destination: destination,
        });
        if (result.success) {
          vscode.window.showInformationMessage(`Success! ${result.message}`);
        } else {
          vscode.window.showInformationMessage(`Error! ${result.message}`);
        }
      } else {
        vscode.window.showInformationMessage("Failed! File is not a JSON");
      }
    });
  }
}

export { createTontoGenerationStatusBarItem };
