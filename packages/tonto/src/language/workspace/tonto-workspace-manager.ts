import { AstNode, DefaultWorkspaceManager, Deferred, Emitter, FileSystemNode, LangiumDocument, LangiumDocumentFactory, WorkspaceFolder } from "langium";
import { CancellationToken } from "vscode";
import { Event } from "vscode-languageserver";
import { URI, Utils } from "vscode-uri";
import { TontoSharedServices } from "../tonto-module.js";
import { basicDataTypes } from "./builtins/basicDataTypes.js";

export class TontoWorkspaceManager extends DefaultWorkspaceManager {
    protected onWorkspaceInitializedEmitter = new Emitter<URI[]>();
    protected workspaceInitializedDeferred = new Deferred<URI[]>();
    private documentFactory: LangiumDocumentFactory;
    private basicDataTypes: string;
    workspaceInitialized = this.workspaceInitializedDeferred.promise;

    constructor(
        protected services: TontoSharedServices,
        protected logger = services.logger.ClientLogger
    ) {
        super(services);
        this.initialBuildOptions = { validation: true };
        this.documentFactory = services.workspace.LangiumDocumentFactory;
        this.basicDataTypes = basicDataTypes;
    }

    override async initializeWorkspace(folders: WorkspaceFolder[], cancelToken?: CancellationToken | undefined): Promise<void> {
        try {
            await super.initializeWorkspace(folders, cancelToken);
            this.logger.info("Workspace Initialized");
            const uris = this.folders?.map(folder => this.getRootFolder(folder)) || [];
            this.workspaceInitializedDeferred.resolve(uris);
            this.onWorkspaceInitializedEmitter.fire(uris);
        } catch (error) {
            this.workspaceInitializedDeferred.reject(error);
        }
    }

    get onWorkspaceInitialized(): Event<URI[]> {
        return this.onWorkspaceInitializedEmitter.event;
    }

    /**
   * Loads built-in libraries into every Tonto Project
   */
    protected override async loadAdditionalDocuments(
        _folders: WorkspaceFolder[],
        _collector: (document: LangiumDocument<AstNode>) => void
    ): Promise<void> {
        const uri = URI.parse("builtin://basicDatatypes.tonto");
        const document = this.documentFactory.fromString(this.basicDataTypes, uri);
        _collector(document);
        console.log("Additional documents loaded");
    }

    protected override includeEntry(_workspaceFolder: WorkspaceFolder, entry: FileSystemNode, fileExtensions: string[]): boolean {
        // Note: same as super implementation but we also allow 'node_modules' directories to be scanned
        const name = Utils.basename(entry.uri);
        if (name.startsWith(".")) {
            return false;
        }
        if (entry.isDirectory) {
            return name !== "node_modules" && name !== "out";
        } else if (entry.isFile) {
            const extname = Utils.extname(entry.uri);
            return fileExtensions.includes(extname);
        }
        return false;
    }
}
