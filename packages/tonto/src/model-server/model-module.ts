import { TextDocument } from "vscode-languageserver-textdocument";
import { ModelService } from "./model-service.js";
import { OpenTextDocumentManager } from "./open-text-document-manager.js";
import { OpenableTextDocuments } from "./openable-text-document.js";

export interface AddedSharedModelServices {
    workspace: {
        TextDocuments: OpenableTextDocuments<TextDocument>;
        TextDocumentManager: OpenTextDocumentManager
    };
    model: {
        ModelService: ModelService;
    }
}