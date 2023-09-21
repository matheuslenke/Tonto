import * as vscode from "vscode";
import { viewCommand, Configuration } from "tonto-cli";
import { CommandIds } from "./commandIds";
import fs from "fs";

function createGenerateDiagramStatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {

  // Register the status bar item command
  context.subscriptions.push(
    vscode.commands.registerCommand(CommandIds.generateDiagramFromButton, () => { createStatusBarItemGenerateDiagramCommand(context) })
  );

  // Register the command pallete command
  context.subscriptions.push(
    vscode.commands.registerCommand(CommandIds.generateDiagram, () => { createCommandPaletteGenerateDiagramCommand(context) })
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

async function generateDiagram(uri: vscode.Uri, context: vscode.ExtensionContext) {
  if (uri.scheme == "file") {
    vscode.workspace.openTextDocument(uri).then(async (document) => {
      if (document.languageId === "tonto") {
        const title = document.fileName?.split('/').pop()?.replace('.tonto', '');

        let panel: vscode.WebviewPanel | null = vscode.window.createWebviewPanel(
          'View',
          `${title}`,
          vscode.ViewColumn.Beside,
          { 
            localResourceRoots: [
              vscode.Uri.joinPath(context.extensionUri, 'src/diagramConfiguration'),
            ],
            retainContextWhenHidden: true,
            enableScripts: true
          }
        );

        panel.onDidDispose(() => {
          panel = null
        });

        const jsUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'src/diagramConfiguration/diagram.config.js'))
        const cssUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'src/diagramConfiguration/diagram.config.css'))

        panel.webview.html = await viewCommand(
          document.fileName, jsUri, cssUri, panel.webview.cspSource, 
          {
            Entity: vscode.workspace.getConfiguration('Diagram').Entity,
            Relation: vscode.workspace.getConfiguration('Diagram').Relation,
            Datatype: vscode.workspace.getConfiguration('Diagram').Datatype,
            Enumeration: vscode.workspace.getConfiguration('Diagram').Enumeration
          } as Configuration
        );

        vscode.workspace.onDidSaveTextDocument(async (document) => {
          if (panel && panel.title === title) {
            panel.webview.html = await viewCommand(
              document.fileName, jsUri, cssUri, panel.webview.cspSource, 
              {
                Entity: vscode.workspace.getConfiguration('Diagram').Entity,
                Relation: vscode.workspace.getConfiguration('Diagram').Relation,
                Datatype: vscode.workspace.getConfiguration('Diagram').Datatype,
                Enumeration: vscode.workspace.getConfiguration('Diagram').Enumeration
              } as Configuration
            );
          }
        });

        // Handle messages from the webview
        // ERRO: Para corrigir -> fazer o pdf apenas do svg e nao da pag completa
        panel.webview.onDidReceiveMessage(
          message => {
            switch (message.command) {
              case 'Download':
                if(panel){
                  /*
                  const doc = new jsPDF();
                  doc.text(panel.webview.html, 15, 15);
                  doc.save(document.fileName.replace('.tonto', '.pdf'));
                  */

                  /*
                  const pdfName = document.fileName.replace('.tonto', '.html');
                  // Crie o arquivo PDF
                  fs.writeFileSync(pdfName, panel.webview.html);

                  // Abra o arquivo PDF na guia do editor do VSCode
                  vscode.workspace.openTextDocument(pdfName).then((document) => {
                    vscode.window.showTextDocument(document);
                  });

                  vscode.window.showInformationMessage(`Download completed: "${pdfName.split('/').pop()}".`);
                  */

                  // vscode.window.showInformationMessage(`Download completed.`);
                }
                return;
            }
          },
          undefined,
          context.subscriptions
        );

      } else {
        vscode.window.showInformationMessage("Failed! File is not a Tonto");
      }
    });
  }
}

async function createCommandPaletteGenerateDiagramCommand(context: vscode.ExtensionContext) {
  
    const fileUri = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: true,
    openLabel: "Select Tonto Files",
  });

  if (fileUri && fileUri[0]) {

    const selectedFile = fileUri[0];
    await generateDiagram(selectedFile, context);
  } else {
    vscode.window.showErrorMessage("Failed! Not a valid file selected");
  }
}

async function createStatusBarItemGenerateDiagramCommand(context: vscode.ExtensionContext) {
  const documentUri: vscode.Uri | undefined = vscode.window.activeTextEditor?.document.uri;
  
  if (documentUri) {
    await generateDiagram(documentUri, context);
  }
}

export { createGenerateDiagramStatusBarItem };