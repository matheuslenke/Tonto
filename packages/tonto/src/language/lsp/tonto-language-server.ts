/* eslint-disable @typescript-eslint/no-explicit-any */
import { DefaultLanguageServer } from "langium/lsp";
import { InitializeParams, InitializeResult } from "vscode-languageserver";
import { TontoSemanticTokenOptions } from "./semantic-token-types.js";

export class TontoLanguageServer extends DefaultLanguageServer {
    protected override buildInitializeResult(_params: InitializeParams): InitializeResult<any> {
        const result = super.buildInitializeResult(_params);
        result.capabilities.semanticTokensProvider = TontoSemanticTokenOptions;
        return result;
    }
}