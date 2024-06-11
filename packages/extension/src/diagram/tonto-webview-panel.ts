import { SprottyDiagramIdentifier, createFileUri, createWebviewPanel } from "sprotty-vscode";
import { LspWebviewPanelManager } from "sprotty-vscode/lib/lsp/lsp-webview-panel-manager.js";
import * as vscode from "vscode";

export class TontoWebviewPanelManager extends LspWebviewPanelManager {

    protected override createWebview(identifier: SprottyDiagramIdentifier): vscode.WebviewPanel {
        const extensionPath = this.options.extensionUri.fsPath;
        return createWebviewPanel(identifier, {
            localResourceRoots: [createFileUri(extensionPath, "out")],
            scriptUri: createFileUri(extensionPath, "out", "webview.cjs")
        });
    }
}