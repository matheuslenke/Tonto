import { AstNode, Deferred, DocumentState, URI, isAstNode } from "langium";
import { Disposable, OptionalVersionedTextDocumentIdentifier, Range, TextDocumentEdit, TextEdit, uinteger } from "vscode-languageserver";
import { TontoServices, TontoSharedServices } from "../language/tonto-module.js";
import { findDocument } from "../utils/ast-util.js";
import { LANGUAGE_CLIENT_ID } from "./openable-text-document.js";
import { CloseModelArgs, ModelSavedEvent, ModelUpdatedEvent, SaveModelArgs, UpdateModelArgs } from "./types.js";

export interface ClientModelArgs {
    uri: string;
    clientId: string;
}

export interface OpenModelArgs extends ClientModelArgs {
    languageId?: string;
}


export class ModelService {
    constructor(
        protected shared: TontoSharedServices,
        protected documentManager = shared.workspace.TextDocumentManager,
        protected documents = shared.workspace.LangiumDocuments,
        protected documentBuilder = shared.workspace.DocumentBuilder
    ) {
        this.documentBuilder.onBuildPhase(DocumentState.Validated, (allChangedDocuments, _token) => {
            for (const changedDocument of allChangedDocuments) {
                const sourceClientId = this.documentManager.getSourceClientId(changedDocument, allChangedDocuments);
                if (sourceClientId === LANGUAGE_CLIENT_ID) {
                    continue;
                }
                const textDocument = changedDocument.textDocument;
                if (this.documentManager.isOpenInLanguageClient(textDocument.uri)) {
                    // we only want to apply a text edit if the editor is already open
                    // because opening and updating at the same time might cause problems as the open call resets the document to filesystem
                    this.shared.lsp.Connection?.workspace.applyEdit({
                        label: "Update Model",
                        documentChanges: [
                            // we use a null version to indicate that the version is known
                            TextDocumentEdit.create(OptionalVersionedTextDocumentIdentifier.create(textDocument.uri, null), [
                                TextEdit.replace(Range.create(0, 0, uinteger.MAX_VALUE, uinteger.MAX_VALUE), textDocument.getText())
                            ])
                        ]
                    });
                }
            }
        });
    }

    /**
       * Opens the document with the given URI for modification.
       *
       * @param uri document URI
       */
    async open(args: OpenModelArgs): Promise<Disposable> {
        return this.documentManager.open(args);
    }

    isOpen(uri: string): boolean {
        return this.documentManager.isOpen(uri);
    }

    /**
    * Closes the document with the given URI for modification.
    *
    * @param uri document URI
    */
    async close(args: CloseModelArgs): Promise<void> {
        if (this.documentManager.isOnlyOpenInClient(args.uri, args.clientId)) {
            // we need to restore the original state without any unsaved changes
            await this.update({ ...args, model: await this.documentManager.readFile(args.uri) });
        }
        return this.documentManager.close(args);
    }
    /**
    * Requests the semantic model stored in the document with the given URI.
    * If the document was not already open for modification, it will be opened automatically.
    *
    * @param uri document URI
    */
    request(uri: string): Promise<AstNode | undefined>;
    /**
     * Requests the semantic model stored in the document with the given URI if it matches the given guard function.
     * If the document was not already open for modification, it will be opened automatically.
     *
     * @param uri document URI
     * @param guard guard function to ensure a certain type of semantic model
     */
    request<T extends AstNode>(uri: string, guard: (item: unknown) => item is T): Promise<T | undefined>;
    async request<T extends AstNode>(uri: string, guard?: (item: unknown) => item is T): Promise<AstNode | T | undefined> {
        const document = await this.documents.getOrCreateDocument(URI.parse(uri));
        const root = document.parseResult.value;
        const check = guard ?? isAstNode;
        return check(root) ? root : undefined;
    }

    /**
     * Updates the semantic model stored in the document with the given model or textual representation of a model.
     * Any previous content will be overridden.
     * If the document was not already open for modification, it will be opened automatically.
     *
     * @param uri document URI
     * @param model semantic model or textual representation of it
     * @returns the stored semantic model
     */
    async update<T extends AstNode>(args: UpdateModelArgs<T>): Promise<T> {
        await this.open(args);
        const documentUri = URI.parse(args.uri);
        const document = await this.documents.getOrCreateDocument(documentUri);
        const root = document.parseResult.value;
        if (!isAstNode(root)) {
            throw new Error(`No AST node to update exists in '${args.uri}'`);
        }
        const textDocument = document.textDocument;
        const text = typeof args.model === "string" ? args.model : this.serialize(documentUri, args.model);
        if (text === textDocument.getText()) {
            return document.parseResult.value as T;
        }
        const newVersion = textDocument.version + 1;
        const pendingUpdate = new Deferred<T>();
        const listener = this.documentBuilder.onBuildPhase(DocumentState.Validated, (allChangedDocuments, _token) => {
            const updatedDocument = allChangedDocuments.find(
                doc => doc.uri.toString() === documentUri.toString() && doc.textDocument.version === newVersion
            );
            if (updatedDocument) {
                pendingUpdate.resolve(updatedDocument.parseResult.value as T);
                listener.dispose();
            }
        });
        const timeout = new Promise<T>((_, reject) =>
            setTimeout(() => {
                listener.dispose();
                reject("Update timed out.");
            }, 5000)
        );
        this.documentManager.update(args.uri, newVersion, text, args.clientId);
        return Promise.race([pendingUpdate.promise, timeout]);
    }

    onModelUpdated<T extends AstNode>(uri: string, listener: (model: ModelUpdatedEvent<T>) => void): Disposable {
        return this.documentManager.onUpdate(uri, listener);
    }

    onModelSaved<T extends AstNode>(uri: string, listener: (model: ModelSavedEvent<T>) => void): Disposable {
        return this.documentManager.onSave(uri, listener);
    }

    /**
     * Overrides the document with the given URI with the given semantic model or text.
     *
     * @param uri document uri
     * @param model semantic model or text
     */
    async save<T extends AstNode>(args: SaveModelArgs<T>): Promise<void> {
        // sync: implicit update of internal data structure to match file system (similar to workspace initialization)
        if (this.documents.hasDocument(URI.parse(args.uri))) {
            await this.update(args);
        }

        const text = typeof args.model === "string" ? args.model : this.serialize(URI.parse(args.uri), args.model);
        return this.documentManager.save(args.uri, text, args.clientId);
    }

    /**
     * Serializes the given semantic model by using the serializer service for the corresponding language.
     *
     * @param uri document uri
     * @param model semantic model
     */
    protected serialize(uri: URI, model: AstNode): string {
        const serializer = this.shared.ServiceRegistry.getServices(uri).serializer.Serializer;
        return serializer.serialize(model);
    }

    getId(node: AstNode, uri = findDocument(node)?.uri): string | undefined {
        if (uri) {
            const services = this.shared.ServiceRegistry.getServices(uri) as TontoServices;
            return services.references.QualifiedNameProvider.getLocalId(node);
        }
        return undefined;
    }

    getGlobalId(node: AstNode, uri = findDocument(node)?.uri): string | undefined {
        if (uri) {
            const services = this.shared.ServiceRegistry.getServices(uri) as TontoServices;
            return services.references.QualifiedNameProvider.getGlobalId(node);
        }
        return undefined;
    }

    // async findReferenceableElements(args: CrossReferenceContext): Promise<ReferenceableElement[]> {
    //     return this.shared.Tonto.references.ScopeProvider.complete(args);
    // }

    // async resolveCrossReference(args: CrossReference): Promise<AstNode | undefined> {
    //     return this.shared.Tonto.references.ScopeProvider.resolveCrossReference(args);
    // }

    // async getSystemInfos(): Promise<SystemInfo[]> {
    //     return this.shared.workspace.PackageManager.getPackageInfos().map(info =>
    //         this.shared.workspace.PackageManager.convertPackageInfoToSystemInfo(info)
    //     );
    // }

    // async getSystemInfo(args: SystemInfoArgs): Promise<SystemInfo | undefined> {
    //     const contextUri = URI.parse(args.contextUri);
    //     const packageInfo =
    //         this.shared.workspace.PackageManager.getPackageInfoByURI(contextUri) ??
    //         this.shared.workspace.PackageManager.getPackageInfoByURI(UriUtils.joinPath(contextUri, PACKAGE_JSON));
    //     if (!packageInfo) {
    //         return undefined;
    //     }
    //     return this.shared.workspace.PackageManager.convertPackageInfoToSystemInfo(packageInfo);
    // }

    // onSystemUpdated(listener: (event: SystemUpdatedEvent) => void): Disposable {
    //     return this.shared.workspace.PackageManager.onUpdate(listener);
    // }
}