/* eslint-disable @typescript-eslint/no-explicit-any */
import { DefaultLanguageServer } from "langium/lsp";
import { InitializeParams, InitializeResult, TextDocumentSyncKind } from "vscode-languageserver";
import { TontoSemanticTokenOptions } from "./semantic-token-types.js";

export class TontoLanguageServer extends DefaultLanguageServer {

    override async initialize(params: InitializeParams): Promise<InitializeResult<any>> {
        const result = await super.initialize(params);
        result.capabilities.textDocumentSync = TextDocumentSyncKind.Full;
        return result;
    }

    protected override buildInitializeResult(_params: InitializeParams): InitializeResult<any> {
        const result = super.buildInitializeResult(_params);
        result.capabilities.semanticTokensProvider = TontoSemanticTokenOptions;
        return result;
    }
}