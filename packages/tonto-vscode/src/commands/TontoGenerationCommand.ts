import path from "path";
import { importModularCommand } from "tonto-cli/src/cli/actions";
import * as vscode from "vscode";

function createTontoGenerationStatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
  const myCommandId = "extension.generateTonto";
  console.log("Creating Tonto Generation Status Bar Item");
  context.subscriptions.push(
    vscode.commands.registerCommand(myCommandId, async (uri: vscode.Uri) => {
      const editor = vscode.window.activeTextEditor;
      if (!uri) {
        const documentUri = editor?.document.uri;
        if (documentUri) {
          uri = documentUri;
        }
      }

      if (uri) {
        await generateTonto(uri);
      }
    })
  );

  // create a new status bar item that we can now manage
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    49
  );
  statusBarItem.command = myCommandId;
  context.subscriptions.push(statusBarItem);

  // register some listener that make sure the status bar
  // item always up-to-date
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => updateTontoStatusBarItem(statusBarItem))
  );
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(() => updateTontoStatusBarItem(statusBarItem))
  );

  // update status bar item once at start
  updateTontoStatusBarItem(statusBarItem);
}

function updateTontoStatusBarItem(statusBarItem: vscode.StatusBarItem): void {
  statusBarItem.text = "$(keybindings-sort) Generate Tonto";
  statusBarItem.show();
}

async function generateTonto(uri: vscode.Uri) {
  if (uri.scheme == "file") {
    vscode.workspace.openTextDocument(uri).then(async (document) => {
      if (document.languageId === "json") {
        const destination = path.join(path.dirname(uri.fsPath), "generated");
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