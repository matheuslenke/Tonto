// import { SprottyDocument, createFileUri, createWebviewHtml } from "sprotty-vscode";
// import { LspSprottyEditorProvider } from "sprotty-vscode/lib/lsp/lsp-sprotty-editor-provider.js";
// import * as vscode from "vscode";


// export class TontoSprottyEditorProvider extends LspSprottyEditorProvider {

//     protected override configureWebview(document: SprottyDocument, webviewPanel: vscode.WebviewPanel, cancelToken: vscode.CancellationToken): Promise<void> | void {
//         const extensionPath = this.options.extensionUri.fsPath;
//         webviewPanel.webview.options = {
//             localResourceRoots: [createFileUri(extensionPath, "out")],
//             enableScripts: true
//         };
//         const identifier = document.endpoint?.diagramIdentifier;
//         if (identifier) {
//             const scriptUri = createFileUri(extensionPath, "out", "webview.cjs");
//             webviewPanel.webview.html = createWebviewHtml(identifier, webviewPanel, { scriptUri });
//         }
//     }
// }