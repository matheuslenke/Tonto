import { registerDefaultCommands, registerTextEditorSync } from "sprotty-vscode/lib/default-contributions.js";
import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node.js";
import { Messenger } from "vscode-messenger";
import { TontoSprottyEditorProvider } from "./tonto-editor-provider.js";
import { TontoViewProvider } from "./tonto-view-provider.js";
import { TontoWebviewPanelManager } from "./tonto-webview-panel.js";

export function activateDiagram(
    context: vscode.ExtensionContext,
    languageClient: LanguageClient): void {
    const diagramMode = process.env.DIAGRAM_MODE || "view";
    if (!["panel", "editor", "view"].includes(diagramMode)) {
        throw new Error("The environment variable 'DIAGRAM_MODE' must be set to 'panel', 'editor' or 'view'.");
    }

    if (diagramMode === "panel") {
        // Set up webview panel manager for freestyle webviews
        const webviewPanelManager = new TontoWebviewPanelManager({
            extensionUri: context.extensionUri,
            defaultDiagramType: "tonto",
            languageClient,
            supportedFileExtensions: [".tonto"]
        });
        registerDefaultCommands(webviewPanelManager, context, { extensionPrefix: "tonto" });
    }

    if (diagramMode === "editor") {
        // Set up webview editor associated with file type
        const webviewEditorProvider = new TontoSprottyEditorProvider({
            extensionUri: context.extensionUri,
            viewType: "tonto",
            languageClient,
            supportedFileExtensions: [".tonto"]
        });
        context.subscriptions.push(
            vscode.window.registerCustomEditorProvider("tonto", webviewEditorProvider, {
                webviewOptions: { retainContextWhenHidden: true }
            })
        );
        registerDefaultCommands(webviewEditorProvider, context, { extensionPrefix: "tonto" });
    }

    if (diagramMode === "view") {
        // Set up webview view shown in the side panel
        const webviewViewProvider = new TontoViewProvider({
            extensionUri: context.extensionUri,
            viewType: "tonto",
            languageClient,
            supportedFileExtensions: [".tonto"],
            openActiveEditor: true,
            messenger: new Messenger({ ignoreHiddenViews: false })
        });
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider("tonto", webviewViewProvider, {
                webviewOptions: { retainContextWhenHidden: true }
            })
        );
        registerDefaultCommands(webviewViewProvider, context, { extensionPrefix: "tonto" });
        registerTextEditorSync(webviewViewProvider, context);
    }
}