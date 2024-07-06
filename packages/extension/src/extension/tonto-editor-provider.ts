import { GlspEditorProvider, GlspVscodeConnector } from "@eclipse-glsp/vscode-integration";
import * as vscode from "vscode";

export default class TontoEditorProvider extends GlspEditorProvider {
    diagramType = "tonto-diagram";

    constructor(
        protected readonly extensionContext: vscode.ExtensionContext,
        protected override readonly glspVscodeConnector: GlspVscodeConnector
    ) {
        super(glspVscodeConnector);
    }

    setUpWebview(
        _document: vscode.CustomDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken,
        clientId: string
    ): void {
        const webview = webviewPanel.webview;
        const extensionUri = this.extensionContext.extensionUri;
        const webviewScriptSourceUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "out", "webview.cjs"));
        const codiconsUri = webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, "node_modules", "@vscode/codicons", "dist", "codicon.css")
        );

        webviewPanel.webview.options = {
            enableScripts: true
        };

        webviewPanel.webview.html = `
             <!DOCTYPE html>
             <html lang="en">
                 <head>
                     <meta charset="UTF-8">
                     <meta name="viewport" content="width=device-width, height=device-height">
                     <meta http-equiv="Content-Security-Policy" content="
                 default-src http://*.fontawesome.com  ${webview.cspSource} 'unsafe-inline' 'unsafe-eval';
                 ">
                 <link href="${codiconsUri}" rel="stylesheet" />
 
                 </head>
                 <body>
                    <div id="${clientId}_container" style="height: 100%;"></div>
                    <script src="${webviewScriptSourceUri}"></script>
                 </body>
             </html>`;
    }
}