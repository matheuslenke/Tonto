
import { CompletionItemKind, InsertTextFormat } from "vscode-languageserver";

import { CompletionAcceptor, CompletionContext, NextFeature } from "langium/lsp";

export function completeForAttributeSnippets(
    context: CompletionContext,
    next: NextFeature, 
    acceptor: CompletionAcceptor) {
    if (next.property === "name") {
      acceptor(context, {
        label: "attribute",
        kind: CompletionItemKind.Snippet,
        detail: "Basic internal association",
        sortText: "100",
        insertText: "${1:name}: ${2:type}",
        insertTextFormat: InsertTextFormat.Snippet,
      });

      acceptor(context, {
        label: "complete-attribute",
        kind: CompletionItemKind.Snippet,
        detail: "Basic internal association",
        sortText: "100",
        insertText: "${1:name}: ${2:type} [${3:*}] { $4 }",
        insertTextFormat: InsertTextFormat.Snippet,
      });
    }
}
