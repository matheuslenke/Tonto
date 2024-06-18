/* eslint-disable @typescript-eslint/no-explicit-any */
import { basename } from "path";
import {
    CancellationToken,
    DidChangeTextDocumentParams,
    DidCloseTextDocumentParams,
    DidOpenTextDocumentParams,
    DidSaveTextDocumentParams,
    Disposable,
    Emitter,
    Event,
    HandlerResult,
    RequestHandler,
    TextDocumentChangeEvent, TextDocuments, TextDocumentsConfiguration,
    TextDocumentSyncKind,
    TextDocumentWillSaveEvent,
    TextEdit,
    WillSaveTextDocumentParams
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";
import { TontoSharedServices } from "../language/tonto-module.js";

export const LANGUAGE_CLIENT_ID = "language-client";

export interface ClientTextDocumentChangeEvent<T> extends TextDocumentChangeEvent<T> {
    clientId: string;
}

export class OpenableTextDocuments<T extends TextDocument> extends TextDocuments<T> {
    protected __clientDocuments = new Map<string, Set<string>>();
    protected __changeHistory = new Map<string, string[]>();

    public constructor(
        protected configuration: TextDocumentsConfiguration<T>,
        protected services: TontoSharedServices,
        protected logger = services.logger.ClientLogger
    ) {
        super(configuration);
    }

    protected get __syncedDocuments(): Map<string, T> {
        return this["_syncedDocuments"];
    }

    protected get __onDidChangeContent(): Emitter<ClientTextDocumentChangeEvent<T>> {
        return this["_onDidChangeContent"];
    }

    override get onDidChangeContent(): Event<ClientTextDocumentChangeEvent<T>> {
        return this.__onDidChangeContent.event;
    }

    protected get __onDidOpen(): Emitter<ClientTextDocumentChangeEvent<T>> {
        return this["_onDidOpen"];
    }

    override get onDidOpen(): Event<ClientTextDocumentChangeEvent<T>> {
        return this.__onDidOpen.event;
    }

    protected get __onDidClose(): Emitter<ClientTextDocumentChangeEvent<T>> {
        return this["_onDidClose"];
    }

    override get onDidClose(): Event<ClientTextDocumentChangeEvent<T>> {
        return this.__onDidClose.event;
    }

    protected get __onDidSave(): Emitter<ClientTextDocumentChangeEvent<T>> {
        return this["_onDidSave"];
    }

    override get onDidSave(): Event<ClientTextDocumentChangeEvent<T>> {
        return this["__onDidSave"].event;
    }

    protected get __onWillSave(): Emitter<TextDocumentWillSaveEvent<T>> {
        return this["_onWillSave"];
    }

    protected get __willSaveWaitUntil(): RequestHandler<TextDocumentWillSaveEvent<T>, TextEdit[], void> | undefined {
        return this["_willSaveWaitUntil"];
    }

    public override listen(connection: any): Disposable {
        (<any>connection).__textDocumentSync = TextDocumentSyncKind.Incremental;
        const disposables: Disposable[] = [];
        disposables.push(
            connection.onDidOpenTextDocument(async (event: DidOpenTextDocumentParams) => {
                await this.services.workspace.WorkspaceManager.workspaceInitialized;
                this.notifyDidOpenTextDocument(event);
            })
        );
        disposables.push(
            connection.onDidChangeTextDocument((event: DidChangeTextDocumentParams) => {
                this.notifyDidChangeTextDocument(event);
            })
        );
        disposables.push(
            connection.onDidCloseTextDocument((event: DidCloseTextDocumentParams) => {
                this.notifyDidCloseTextDocument(event);
            })
        );
        disposables.push(
            connection.onWillSaveTextDocument((event: WillSaveTextDocumentParams) => {
                this.notifyWillSaveTextDocument(event);
            })
        );
        disposables.push(
            connection.onWillSaveTextDocumentWaitUntil((event: WillSaveTextDocumentParams, token: CancellationToken) =>
                this.notifyWillSaveTextDocumentWaitUntil(event, token)
            )
        );
        disposables.push(
            connection.onDidSaveTextDocument((event: DidSaveTextDocumentParams) => {
                this.notifyDidSaveTextDocument(event);
            })
        );
        return Disposable.create(() => {
            disposables.forEach(disposable => disposable.dispose());
        });
    }

    public notifyDidChangeTextDocument(event: DidChangeTextDocumentParams, clientId = LANGUAGE_CLIENT_ID): void {
        const td = event.textDocument;
        const changes = event.contentChanges;
        if (changes.length === 0) {
            return;
        }

        const { version } = td;
        if (version === null || version === undefined) {
            throw new Error(`Received document change event for ${td.uri} without valid version identifier`);
        }

        let document = this.__syncedDocuments.get(td.uri);
        if (document !== undefined) {
            if (document.version >= td.version) {
                this.log(document.uri, `Update is out of date (${document.version} >= ${td.version}): Ignore update by ${clientId}`);
                return;
            }
            document = this.configuration.update(document, changes, version);
            this.__syncedDocuments.set(td.uri, document);
            const changeHistory = this.__changeHistory.get(td.uri) || [];
            changeHistory[td.version] = clientId;
            this.__changeHistory.set(td.uri, changeHistory);
            this.log(document.uri, `Update to version ${td.version} by ${clientId}`);
            this.__onDidChangeContent.fire(Object.freeze({ document, clientId }));
        }
    }

    public notifyDidCloseTextDocument(event: DidCloseTextDocumentParams, clientId = LANGUAGE_CLIENT_ID): void {
        if (!this.isOpenInClient(event.textDocument.uri, clientId)) {
            return;
        }
        this.__clientDocuments.get(event.textDocument.uri)?.delete(clientId);
        const syncedDocument = this.__syncedDocuments.get(event.textDocument.uri);
        if (syncedDocument !== undefined) {
            this.log(syncedDocument.uri, `Closed synced document: ${syncedDocument.version} by ${clientId}`);
            this.__onDidClose.fire(Object.freeze({ document: syncedDocument, clientId }));

            if (!this.__clientDocuments.get(event.textDocument.uri)?.size) {
                // last client closed the document, delete sync state
                this.log(syncedDocument.uri, `Remove synced document: ${syncedDocument.version} (no client left)`);
                this.__syncedDocuments.delete(event.textDocument.uri);
                this.__changeHistory.delete(event.textDocument.uri);
            }
        }
    }

    public notifyWillSaveTextDocument(event: WillSaveTextDocumentParams): void {
        const syncedDocument = this.__syncedDocuments.get(event.textDocument.uri);
        if (syncedDocument !== undefined) {
            this.__onWillSave.fire(Object.freeze({ document: syncedDocument, reason: event.reason }));
        }
    }

    public notifyWillSaveTextDocumentWaitUntil(
        event: WillSaveTextDocumentParams,
        token: CancellationToken
    ): HandlerResult<TextEdit[], void> {
        const syncedDocument = this.__syncedDocuments.get(event.textDocument.uri);
        if (syncedDocument !== undefined && this.__willSaveWaitUntil) {
            return this.__willSaveWaitUntil(Object.freeze({ document: syncedDocument, reason: event.reason }), token);
        } else {
            return [];
        }
    }

    public notifyDidSaveTextDocument(event: DidSaveTextDocumentParams, clientId = LANGUAGE_CLIENT_ID): void {
        const syncedDocument = this.__syncedDocuments.get(event.textDocument.uri);
        if (syncedDocument !== undefined) {
            this.log(syncedDocument.uri, `Saved synced document: ${syncedDocument.version} by ${clientId}`);
            this.__onDidSave.fire(Object.freeze({ document: syncedDocument, clientId }));
        }
    }

    public notifyDidOpenTextDocument(event: DidOpenTextDocumentParams, clientId = LANGUAGE_CLIENT_ID): void {
        if (this.isOpenInClient(event.textDocument.uri, clientId)) {
            return;
        }
        const td = event.textDocument;
        let document = this.__syncedDocuments.get(td.uri);
        const clients = this.__clientDocuments.get(td.uri) || new Set();
        clients.add(clientId);
        this.__clientDocuments.set(td.uri, clients);
        if (!document) {
            // no synced document yet, create new one
            this.log(td.uri, `Opened new document: ${td.version} by ${clientId}`);
            document = this.configuration.create(td.uri, td.languageId, td.version, td.text);
            this.__syncedDocuments.set(td.uri, document);
            this.__changeHistory.set(td.uri, [clientId]);
            const toFire = Object.freeze({ document, clientId });
            this.__onDidOpen.fire(toFire);
            this.__onDidChangeContent.fire(toFire);
        } else {
            // document was already synced, so we just change a content change
            this.log(td.uri, `Opened synced document: ${td.version} by ${clientId}`);
            const toFire = Object.freeze({ document, clientId });
            this.__onDidChangeContent.fire(toFire);
        }
    }

    getChangeSource(uri: string, version?: number): string | undefined {
        const history = this.__changeHistory.get(uri);
        // given version or last entry
        return version ? history?.[version] : history?.at(-1);
    }

    isOpen(uri: string): boolean {
        return this.__syncedDocuments.has(uri);
    }

    isOpenInClient(uri: string, client: string): boolean {
        return !!this.__clientDocuments.get(uri)?.has(client);
    }

    isOpenInLanguageClient(uri: string): boolean {
        return this.isOpenInClient(uri, LANGUAGE_CLIENT_ID);
    }

    isOnlyOpenInClient(uri: string, client: string): boolean {
        return this.__clientDocuments.get(uri)?.size === 1 && this.isOpenInClient(uri, client);
    }

    protected log(uri: string, message: string): void {
        const full = URI.parse(uri);
        this.logger.info(`[Documents][${basename(full.fsPath)}] ${message}`);
    }
}