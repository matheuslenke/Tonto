import { WebviewEndpoint, createFileUri, createWebviewHtml } from "sprotty-vscode";
import { LspSprottyViewProvider } from "sprotty-vscode/lib/lsp/lsp-sprotty-view-provider.js";
import { CancellationToken, WebviewView } from "vscode";

export class TontoViewProvider extends LspSprottyViewProvider {
    protected override configureWebview(webviewView: WebviewView, endpoint: WebviewEndpoint, cancelToken: CancellationToken): void | Promise<void> {
        const extensionPath = this.options.extensionUri.fsPath;
        webviewView.webview.options = {
            localResourceRoots: [createFileUri(extensionPath, "out")],
            enableScripts: true
        };
        let identifier = endpoint.diagramIdentifier;
        if (!identifier) {
            // Create a preliminary diagram identifier to fill the webview's HTML content
            identifier = { clientId: this.clientId, diagramType: this.options.viewType, uri: "" };
        }
        const scriptUri = createFileUri(extensionPath, "out", "webview.cjs");
        webviewView.webview.html = createWebviewHtml(identifier, webviewView, { scriptUri });
    }
}