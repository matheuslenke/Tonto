import path from "node:path";
import {
    TontoDiagramGraph,
    TontoDiagramIssue,
    buildTontoDiagramGraph,
    parseTontoDiagramSpec,
    serializeTontoDiagramSpec,
    updateTontoDiagramLayout
} from "tonto-cli";
import * as vscode from "vscode";

type DiagramDocumentStateMessage = {
    type: "documentState";
    status: "loading" | "ready" | "error";
    documentText: string;
    graph?: TontoDiagramGraph;
    issues: TontoDiagramIssue[];
};

type DiagramReadyMessage = {
    type: "ready";
};

type DiagramSourceUpdateMessage = {
    type: "updateSource";
    text: string;
};

type DiagramLayoutUpdateMessage = {
    type: "updateLayout";
    nodes: Array<{
        id: string;
        specifier: string;
        x: number;
        y: number;
    }>;
};

type DiagramIncomingMessage = DiagramReadyMessage | DiagramSourceUpdateMessage | DiagramLayoutUpdateMessage;

type DiagramEditorPanelState = {
    panel: vscode.WebviewPanel;
    sourcePath?: string;
    requestVersion: number;
    disposed: boolean;
};

export class TontoDiagramEditorProvider implements vscode.CustomTextEditorProvider, vscode.Disposable {
    public static readonly viewType = "tonto.diagram.editor";

    private readonly panelsByDocument = new Map<string, Set<DiagramEditorPanelState>>();
    private readonly documentsBySourcePath = new Map<string, Set<string>>();
    private readonly disposables: vscode.Disposable[] = [];

    constructor(private readonly context: vscode.ExtensionContext) {
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(async (event) => {
                if (event.document.languageId !== "tontodiagram") {
                    return;
                }

                await this.refreshDocumentEditors(event.document);
            }),
            vscode.workspace.onDidSaveTextDocument(async (document) => {
                if (document.languageId === "tonto") {
                    await this.refreshEditorsForSourcePath(document.uri.fsPath);
                    return;
                }

                if (document.languageId === "tontodiagram") {
                    await this.refreshDocumentEditors(document);
                }
            }),
        );
    }

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new TontoDiagramEditorProvider(context);
        return vscode.Disposable.from(
            vscode.window.registerCustomEditorProvider(TontoDiagramEditorProvider.viewType, provider, {
                webviewOptions: {
                    retainContextWhenHidden: true,
                },
                supportsMultipleEditorsPerDocument: true,
            }),
            provider,
        );
    }

    public dispose(): void {
        for (const panelState of this.getPanelStates()) {
            panelState.panel.dispose();
        }

        vscode.Disposable.from(...this.disposables).dispose();
        this.disposables.length = 0;
        this.panelsByDocument.clear();
        this.documentsBySourcePath.clear();
    }

    async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken,
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, "pack", "webview")],
        };
        webviewPanel.webview.html = createDiagramEditorHtml(this.context.extensionUri, webviewPanel.webview);

        const panelState: DiagramEditorPanelState = {
            panel: webviewPanel,
            requestVersion: 0,
            disposed: false,
        };
        this.registerPanel(document.uri, panelState);

        webviewPanel.onDidDispose(() => {
            panelState.disposed = true;
            this.unregisterPanel(document.uri, panelState);
        });

        webviewPanel.webview.onDidReceiveMessage(async (message: DiagramIncomingMessage) => {
            await this.handleIncomingMessage(document, message);
        });

        void this.pushDocumentState(document, panelState);
    }

    private async handleIncomingMessage(document: vscode.TextDocument, message: DiagramIncomingMessage): Promise<void> {
        if (message.type === "ready") {
            await this.refreshDocumentEditors(document);
            return;
        }

        if (message.type === "updateSource") {
            await this.replaceDocumentText(document, message.text);
            return;
        }

        if (message.type === "updateLayout") {
            const parsed = parseTontoDiagramSpec(document.getText());
            if (!parsed.spec) {
                return;
            }

            const updatedSpec = updateTontoDiagramLayout(
                parsed.spec,
                message.nodes.map((node) => ({
                    target: node.specifier,
                    x: node.x,
                    y: node.y,
                }))
            );

            const serialized = serializeTontoDiagramSpec(updatedSpec);
            if (serialized !== document.getText()) {
                await this.replaceDocumentText(document, serialized);
            }
        }
    }

    private async refreshDocumentEditors(document: vscode.TextDocument): Promise<void> {
        const documentPanels = this.panelsByDocument.get(document.uri.toString());
        if (!documentPanels) {
            return;
        }

        await Promise.all(
            [...documentPanels].map(async (panelState) => {
                await this.pushDocumentState(document, panelState);
            }),
        );
    }

    private async refreshEditorsForSourcePath(sourcePath: string): Promise<void> {
        const affectedDocuments = this.documentsBySourcePath.get(sourcePath);
        if (!affectedDocuments) {
            return;
        }

        await Promise.all(
            [...affectedDocuments].map(async (documentKey) => {
                const document = vscode.workspace.textDocuments.find((candidate) => candidate.uri.toString() === documentKey);
                if (!document) {
                    return;
                }

                await this.refreshDocumentEditors(document);
            }),
        );
    }

    private async pushDocumentState(document: vscode.TextDocument, panelState: DiagramEditorPanelState): Promise<void> {
        const requestVersion = ++panelState.requestVersion;
        const immediateState = this.createImmediateDocumentState(document);

        if (panelState.disposed) {
            return;
        }

        await panelState.panel.webview.postMessage(immediateState.message);

        if (!immediateState.parsed.spec) {
            this.remapDocumentSource(document.uri.toString(), panelState.sourcePath, undefined);
            panelState.sourcePath = undefined;
            return;
        }

        const documentState = await this.createResolvedDocumentState(document, immediateState.parsed, immediateState.message);
        if (panelState.disposed || panelState.requestVersion !== requestVersion) {
            return;
        }

        this.remapDocumentSource(document.uri.toString(), panelState.sourcePath, documentState.graph?.source);
        panelState.sourcePath = documentState.graph?.source;

        await panelState.panel.webview.postMessage(documentState);
    }

    private createImmediateDocumentState(document: vscode.TextDocument): {
        parsed: ReturnType<typeof parseTontoDiagramSpec>;
        message: DiagramDocumentStateMessage;
    } {
        const parsed = parseTontoDiagramSpec(document.getText());
        return {
            parsed,
            message: {
                type: "documentState",
                status: parsed.spec ? "loading" : "error",
                documentText: document.getText(),
                issues: [...parsed.issues],
            },
        };
    }

    private async createResolvedDocumentState(
        document: vscode.TextDocument,
        parsed: ReturnType<typeof parseTontoDiagramSpec>,
        immediateState: DiagramDocumentStateMessage,
    ): Promise<DiagramDocumentStateMessage> {
        const issues = [...immediateState.issues];
        let graph: TontoDiagramGraph | undefined;
        let status: DiagramDocumentStateMessage["status"] = "ready";

        if (parsed.spec) {
            try {
                graph = await buildTontoDiagramGraph(parsed.spec, document.uri.fsPath);
                issues.push(...graph.issues);
            } catch (error) {
                status = "error";
                issues.push({
                    severity: "error",
                    message: error instanceof Error ? error.message : String(error),
                });
            }
        }

        return {
            type: "documentState",
            status,
            documentText: immediateState.documentText,
            graph,
            issues,
        };
    }

    private registerPanel(documentUri: vscode.Uri, panelState: DiagramEditorPanelState): void {
        const documentKey = documentUri.toString();
        if (!this.panelsByDocument.has(documentKey)) {
            this.panelsByDocument.set(documentKey, new Set());
        }

        this.panelsByDocument.get(documentKey)?.add(panelState);
    }

    private unregisterPanel(documentUri: vscode.Uri, panelState: DiagramEditorPanelState): void {
        const documentKey = documentUri.toString();
        const documentPanels = this.panelsByDocument.get(documentKey);
        if (documentPanels) {
            documentPanels.delete(panelState);
            if (documentPanels.size === 0) {
                this.panelsByDocument.delete(documentKey);
            }
        }

        if (panelState.sourcePath) {
            const documents = this.documentsBySourcePath.get(panelState.sourcePath);
            documents?.delete(documentKey);
            if (documents && documents.size === 0) {
                this.documentsBySourcePath.delete(panelState.sourcePath);
            }
        }
    }

    private remapDocumentSource(documentKey: string, previousSourcePath: string | undefined, nextSourcePath: string | undefined): void {
        if (previousSourcePath) {
            const previousDocuments = this.documentsBySourcePath.get(previousSourcePath);
            previousDocuments?.delete(documentKey);
            if (previousDocuments && previousDocuments.size === 0) {
                this.documentsBySourcePath.delete(previousSourcePath);
            }
        }

        if (nextSourcePath) {
            if (!this.documentsBySourcePath.has(nextSourcePath)) {
                this.documentsBySourcePath.set(nextSourcePath, new Set());
            }
            this.documentsBySourcePath.get(nextSourcePath)?.add(documentKey);
        }
    }

    private async replaceDocumentText(document: vscode.TextDocument, nextText: string): Promise<void> {
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length),
        );
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, fullRange, nextText);
        await vscode.workspace.applyEdit(edit);
    }

    private getPanelStates(): DiagramEditorPanelState[] {
        return [...this.panelsByDocument.values()].flatMap((panelStates) => [...panelStates]);
    }
}

function createDiagramEditorHtml(extensionUri: vscode.Uri, webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "pack", "webview", "diagram-editor.js"));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "pack", "webview", "style.css"));

    return `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; script-src ${webview.cspSource}; style-src 'unsafe-inline' ${webview.cspSource}; font-src ${webview.cspSource};">
        <link rel="stylesheet" href="${styleUri}">
        <title>Tonto Diagram Editor</title>
    </head>
    <body>
        <div id="root" data-diagram-name="${escapeHtml(path.basename(extensionUri.fsPath))}"></div>
        <script type="module" src="${scriptUri}"></script>
    </body>
</html>`;
}

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
