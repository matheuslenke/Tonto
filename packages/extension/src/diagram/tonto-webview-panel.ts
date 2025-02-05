import { createFileUri, createWebviewPanel, SprottyDiagramIdentifier } from "sprotty-vscode";
import * as vscode from "vscode";
import { LspWebviewPanelManager, LspWebviewPanelManagerOptions } from "./overrides/lsp-webview-panel-manager.js";


export class TontoWebviewPanelManager extends LspWebviewPanelManager {

    constructor(options: LspWebviewPanelManagerOptions) {
        super(options);
    }

    protected override createWebview(identifier: SprottyDiagramIdentifier): vscode.WebviewPanel {
        const extensionPath = this.options.extensionUri.fsPath;
        return createWebviewPanel(identifier, {
            localResourceRoots: [createFileUri(extensionPath, "out", "diagram")],
            scriptUri: createFileUri(extensionPath, "pack", "diagram", "main.js")
        });
    }
}