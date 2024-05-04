import { CompletionItemKind } from "vscode-languageserver";
import { InsertTextFormat } from "vscode-languageserver-types";

import { CompletionAcceptor, CompletionContext, NextFeature } from "langium/lsp";

function completeForEnumSnippets(
    context: CompletionContext, 
    next: NextFeature, 
    acceptor: CompletionAcceptor) {
    acceptor(context, {
      label: "enum",
      kind: CompletionItemKind.Snippet,
      detail: "Basic internal association",
      sortText: "100",
      insertText: ["enum ${1:name} {", "$2", "}"].join("\n"),
      insertTextFormat: InsertTextFormat.Snippet,
    });
}

export { completeForEnumSnippets };
