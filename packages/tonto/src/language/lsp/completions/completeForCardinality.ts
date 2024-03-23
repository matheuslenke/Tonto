
// import { CompletionItemKind } from "vscode-languageserver";

import { CompletionAcceptor } from "langium/lsp";

function completeForCardinality(acceptor: CompletionAcceptor) {
    // acceptor({
    //   label: "[1]",
    //   kind: CompletionItemKind.Keyword,
    //   detail: "Cardinality",
    //   sortText: "0",
    // });
    // acceptor({
    //   label: "[*]",
    //   kind: CompletionItemKind.Keyword,
    //   detail: "Cardinality",
    //   sortText: "0",
    // });
    // acceptor({
    //   label: "[0..*]",
    //   kind: CompletionItemKind.Keyword,
    //   detail: "Cardinality",
    //   sortText: "0",
    // });
    // acceptor({
    //   label: "[0..2]",
    //   kind: CompletionItemKind.Keyword,
    //   detail: "Cardinality",
    //   sortText: "0",
    // });
}

export { completeForCardinality };
