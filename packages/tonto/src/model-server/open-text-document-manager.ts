

import * as fs from "fs";
import { AstNode, Disposable, DocumentBuilder, DocumentState, FileSystemProvider, LangiumDefaultSharedCoreServices, LangiumDocument, LangiumDocuments } from "langium";
import { VersionedTextDocumentIdentifier } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { TextDocumentIdentifier, TextDocumentItem } from "vscode-languageserver-types";
import { URI } from "vscode-uri";
import { TontoLanguageMetaData } from "../language/index.js";
import { AddedSharedModelServices } from "./model-module.js";
import { OpenModelArgs } from "./model-service.js";
import { OpenableTextDocuments } from "./openable-text-document.js";
import { CloseModelArgs, ModelSavedEvent, ModelUpdatedEvent } from "./types.js";

export interface UpdateInfo {
    changed: URI[];
    deleted: URI[];
}

export class OpenTextDocumentManager {
    protected textDocuments: OpenableTextDocuments<TextDocument>;
    protected fileSystemProvider: FileSystemProvider;
    protected langiumDocs: LangiumDocuments;
    protected documentBuilder: DocumentBuilder;

    protected lastUpdate?: UpdateInfo;

    constructor(services: AddedSharedModelServices & LangiumDefaultSharedCoreServices) {
        this.textDocuments = services.workspace.TextDocuments;
        this.fileSystemProvider = services.workspace.FileSystemProvider;
        this.langiumDocs = services.workspace.LangiumDocuments;
        this.documentBuilder = services.workspace.DocumentBuilder;

        this.textDocuments.onDidOpen(event =>
            this.open({ clientId: event.clientId, uri: event.document.uri, languageId: event.document.languageId })
        );
        this.textDocuments.onDidClose(event => this.close({ clientId: event.clientId, uri: event.document.uri }));
        this.documentBuilder.onUpdate((changed, deleted) => {
            this.lastUpdate = { changed, deleted };
        });
    }

    /**
 * Subscribe to the save event of the textdocument.
 *
 * @param uri Uri of the document to listen to. The callback only gets called when this URI and the URI of the saved document
 * are equal.
 * @param listener Callback to be called
 * @returns Disposable object
 */
    onSave<T extends AstNode>(uri: string, listener: (model: ModelSavedEvent<T>) => void): Disposable {
        return this.textDocuments.onDidSave(event => {
            const documentURI = URI.parse(event.document.uri);

            // Check if the uri of the saved document and the uri of the listener are equal.
            if (event.document.uri === uri && documentURI !== undefined && this.langiumDocs.hasDocument(documentURI)) {
                this.langiumDocs.getOrCreateDocument(documentURI)
                    .then(doc => {
                        const root = doc.parseResult.value;
                        return listener({ model: root as T, uri: event.document.uri, sourceClientId: event.clientId });
                    });
            }

            return undefined;
        });
    }

    onUpdate<T extends AstNode>(uri: string, listener: (model: ModelUpdatedEvent<T>) => void): Disposable {
        return this.documentBuilder.onBuildPhase(DocumentState.Validated, (allChangedDocuments, _token) => {
            const changedDocument = allChangedDocuments.find(document => document.uri.toString() === uri);
            if (changedDocument) {
                const buildTrigger = allChangedDocuments.find(document => document.uri.toString() === this.lastUpdate?.changed?.[0].toString());
                const sourceClientId = this.getSourceClientId(buildTrigger ?? changedDocument, allChangedDocuments);
                const event: ModelUpdatedEvent<T> = {
                    model: changedDocument.parseResult.value as T,
                    sourceClientId,
                    uri: changedDocument.textDocument.uri,
                    reason: this.lastUpdate?.changed.includes(changedDocument.uri)
                        ? "changed"
                        : this.lastUpdate?.deleted.includes(changedDocument.uri)
                            ? "deleted"
                            : "updated"
                };
                listener(event);
            }
        });
    }

    getSourceClientId(preferred: LangiumDocument<AstNode>, rest: LangiumDocument<AstNode>[]): string {
        const clientId = this.textDocuments.getChangeSource(preferred.textDocument.uri, preferred.textDocument.version);
        if (clientId) {
            return clientId;
        }
        return (
            rest
                .map(document => this.textDocuments.getChangeSource(document.textDocument.uri, document.textDocument.version))
                .find(source => source !== undefined) || "unknown"
        );
    }

    async open(args: OpenModelArgs): Promise<Disposable> {
        // only create a dummy document if it is already open as we use the synced state anyway
        const textDocument = this.isOpen(args.uri)
            ? this.createDummyDocument(args.uri)
            : await this.createDocumentFromFileSystem(args.uri, args.languageId);
        this.textDocuments.notifyDidOpenTextDocument({ textDocument }, args.clientId);
        return Disposable.create(() => this.close(args));
    }

    async close(args: CloseModelArgs): Promise<void> {
        this.textDocuments.notifyDidCloseTextDocument({ textDocument: TextDocumentIdentifier.create(args.uri) }, args.clientId);
    }

    async update(uri: string, version: number, text: string, clientId: string): Promise<void> {
        if (!this.isOpen(uri)) {
            throw new Error(`Document ${uri} hasn't been opened for updating yet`);
        }
        this.textDocuments.notifyDidChangeTextDocument(
            {
                textDocument: VersionedTextDocumentIdentifier.create(uri, version),
                contentChanges: [{ text }]
            },
            clientId
        );
    }

    async save(uri: string, text: string, clientId: string): Promise<void> {
        const vscUri = URI.parse(uri);
        fs.writeFileSync(vscUri.fsPath, text);
        this.textDocuments.notifyDidSaveTextDocument({ textDocument: TextDocumentIdentifier.create(uri), text }, clientId);
    }

    isOpen(uri: string): boolean {
        return !!this.textDocuments.get(this.normalizedUri(uri)) || !!this.textDocuments.get(uri);
    }

    isOpenInLanguageClient(uri: string): boolean {
        return this.textDocuments.isOpenInLanguageClient(this.normalizedUri(uri));
    }

    isOnlyOpenInClient(uri: string, client: string): boolean {
        return this.textDocuments.isOnlyOpenInClient(this.normalizedUri(uri), client);
    }

    protected createDummyDocument(uri: string): TextDocumentItem {
        return TextDocumentItem.create(this.normalizedUri(uri), TontoLanguageMetaData.languageId, 0, "");
    }
    protected async createDocumentFromFileSystem(
        uri: string,
        languageId: string = TontoLanguageMetaData.languageId
    ): Promise<TextDocumentItem> {
        return TextDocumentItem.create(uri, languageId, 0, await this.readFile(uri));
    }

    async readFile(uri: string): Promise<string> {
        return this.fileSystemProvider.readFile(URI.parse(uri));
    }

    protected normalizedUri(uri: string): string {
        return URI.parse(uri).toString();
    }
}