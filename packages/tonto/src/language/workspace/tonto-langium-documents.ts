/* eslint-disable @typescript-eslint/no-explicit-any */
import { DefaultLangiumDocuments, DocumentState, LangiumDocument } from "langium";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";
import { Utils } from "../../utils/uri-utils.js";
import { Model } from "../generated/ast.js";


export class TontoLangiumDocuments extends DefaultLangiumDocuments {
    override getOrCreateDocument(uri: URI): any {
        const document = this.getDocument(uri);
        if (document) {
            return document;
        }
        const documentUri = this.getDocumentUri(uri);
        if (documentUri) {
            return super.getOrCreateDocument(documentUri);
        }
        return this.createEmptyDocument(uri);
    }

    protected getDocumentUri(uri: URI): URI | undefined {
        // we register for package.json files because our package scoping mechanism depends on it
        // but we do not want actually want to parse them
        // we want to resolve existing URIs to properly deal with linked files and folders and not create duplicates for them
        return Utils.toRealURIorUndefined(uri);
    }

    createEmptyDocument(uri: URI, rootType = Model): LangiumDocument {
        const document: LangiumDocument = {
            uri,
            parseResult: { lexerErrors: [], parserErrors: [], value: { $type: rootType } },
            references: [],
            state: DocumentState.Validated,
            textDocument: TextDocument.create(uri.toString(), "", 1, ""),
            diagnostics: []
        };
        // fixDocument(document.parseResult.value, document);
        return document;
    }

    override getDocument(uri: URI): LangiumDocument<Model> | undefined {
        return this.documentMap.get(uri.toString()) as LangiumDocument<Model> | undefined;
    }
}
