import * as vscode from "vscode";
import { viewCommand, Configuration } from "tonto-cli";
import { CommandIds } from "./commandIds";

function createGenerateDiagramStatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {

  // Register the status bar item command
  context.subscriptions.push(
    vscode.commands.registerCommand(CommandIds.generateDiagramFromButton, createStatusBarItemGenerateDiagramCommand)
  );

  // Register the command pallete command
  context.subscriptions.push(
    vscode.commands.registerCommand(CommandIds.generateDiagram, createCommandPaletteGenerateDiagramCommand)
  );

  return createStatusBarItem(context, statusBarItem);
}

function createStatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
  // create a new status bar item that we can now manage
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 60);
  statusBarItem.command = CommandIds.generateDiagramFromButton;
  context.subscriptions.push(statusBarItem);

  // register some listener that make sure the status bar
  // item always up-to-date
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      updateDiagramStatusBarItem(statusBarItem);
    })
  );
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(() => {
      updateDiagramStatusBarItem(statusBarItem);
    })
  );

  // update status bar item once at start
  updateDiagramStatusBarItem(statusBarItem);

  return statusBarItem;
}

function updateDiagramStatusBarItem(statusBarItem: vscode.StatusBarItem): void {
  statusBarItem.text = "$(notebook-render-output) Tonto -> Diagram";
  statusBarItem.show();
}

async function generateDiagram(uri: vscode.Uri) {
    if (uri.scheme == "file") {
      vscode.workspace.openTextDocument(uri).then(async (document) => {
        if (document.languageId === "tonto") {
          
          let panel: vscode.WebviewPanel | null = vscode.window.createWebviewPanel(
            'View',
            `${document.fileName?.split('/').pop()?.replace('.tonto', '')}`,
            vscode.ViewColumn.Beside,
            { 
              // localResourceRoots: [
              //   vscode.Uri.file(`${auxContext.extensionPath}/src/extension/diagram.config`),
              // ],
              retainContextWhenHidden: true,
              enableScripts: true
            }
          );

          panel.onDidDispose(() => {
            panel = null
          });
        
          panel.webview.html = await viewCommand(
            document.fileName,
            {
              Entity: vscode.workspace.getConfiguration('Diagram').Entity,
              Relation: vscode.workspace.getConfiguration('Diagram').Relation,
              Datatype: vscode.workspace.getConfiguration('Diagram').Datatype,
              Enumeration: vscode.workspace.getConfiguration('Diagram').Enumeration
            } as Configuration
          );

          vscode.workspace.onDidSaveTextDocument(async (document) => {
            // const activeEditor = vscode.window.activeTextEditor;
            // if(document === activeEditor.document)
            if (panel && panel.title === document.fileName?.split('/').pop()?.replace('.tonto', '')) {
              panel.webview.html = await viewCommand(
                document.fileName,
                {
                  Entity: vscode.workspace.getConfiguration('Diagram').Entity,
                  Relation: vscode.workspace.getConfiguration('Diagram').Relation,
                  Datatype: vscode.workspace.getConfiguration('Diagram').Datatype,
                  Enumeration: vscode.workspace.getConfiguration('Diagram').Enumeration
                } as Configuration
              );
            }
          });
        } else {
          vscode.window.showInformationMessage("Failed! File is not a Tonto");
        }
      });
    }
}

async function createCommandPaletteGenerateDiagramCommand() {
  
    const fileUri = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    openLabel: "Select Tonto File",
  });

  if (fileUri && fileUri[0]) {

    const selectedFile = fileUri[0];
    await generateDiagram(selectedFile);
  } else {
    vscode.window.showErrorMessage("Failed! Not a valid file selected");
  }
}

async function createStatusBarItemGenerateDiagramCommand(uri: vscode.Uri) {
    const editor = vscode.window.activeTextEditor;
    if (!uri) {
      const documentUri = editor?.document.uri;
      if (documentUri) {
        uri = documentUri;
      }
    }
  
    if (uri) {
      await generateDiagram(uri);
    }
  }

export { createGenerateDiagramStatusBarItem };