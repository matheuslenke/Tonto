import { CompletionItemKind } from "vscode-languageserver";
import { InsertTextFormat } from "vscode-languageserver-types";
import { completeForCardinality } from "./completeForCardinality.js";

import { CompletionAcceptor, CompletionContext, NextFeature } from "langium/lsp";

function completeForElementRelation(
    context: CompletionContext,
    keyword: NextFeature, 
    acceptor: CompletionAcceptor) {
    switch (keyword.property) {
      case "--":
        acceptor(context, {
          label: "-- $relationName --",
          kind: CompletionItemKind.Snippet,
          detail: "Association",
          insertTextFormat: InsertTextFormat.Snippet,
          sortText: "10",
        });
        acceptor(context, {
          label: "--",
          kind: CompletionItemKind.Keyword,
          detail: "Association",
          sortText: "1",
        });
        break;
      case "<>--":
        acceptor(context, {
          label: "<>-- $relationName --",
          kind: CompletionItemKind.Snippet,
          detail: "Composition",
          sortText: "10",
          insertTextFormat: InsertTextFormat.Snippet,
        });
        acceptor(context, {
          label: "<>--",
          kind: CompletionItemKind.Keyword,
          detail: "Association",
          sortText: "1",
        });
        break;
      case "[":
        completeForCardinality(context, acceptor);
        break;
      case "(":
        acceptor(context, {
          label: "( $endName )",
          kind: CompletionItemKind.Snippet,
          detail: "End name",
          sortText: "10",
          insertTextFormat: InsertTextFormat.Snippet,
        });
        acceptor(context, {
          label: "( { ${1:const} } ${2:endName} )",
          kind: CompletionItemKind.Snippet,
          detail: "Complete end name",
          sortText: "10",
          insertTextFormat: InsertTextFormat.Snippet,
        });
        break;
    }
}

export { completeForElementRelation };
