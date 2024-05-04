
import { CompletionItemKind } from "vscode-languageserver";

import { CompletionAcceptor, CompletionContext } from "langium/lsp";

function completeForCardinality(context: CompletionContext, acceptor: CompletionAcceptor) {
    acceptor(context, {
      label: "[1]",
      kind: CompletionItemKind.Keyword,
      detail: "Cardinality",
      sortText: "0",
    });
    acceptor(context, {
      label: "[*]",
      kind: CompletionItemKind.Keyword,
      detail: "Cardinality",
      sortText: "0",
    });
    acceptor(context, {
      label: "[0..*]",
      kind: CompletionItemKind.Keyword,
      detail: "Cardinality",
      sortText: "0",
    });
    acceptor(context, {
      label: "[0..2]",
      kind: CompletionItemKind.Keyword,
      detail: "Cardinality",
      sortText: "0",
    });
}

export { completeForCardinality };
