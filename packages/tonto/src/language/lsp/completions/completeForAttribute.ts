
// import { AbstractElement } from "langium/grammar/generated/ast.js";
// import { CompletionItemKind } from "vscode-languageserver";
// import { InsertTextFormat } from "vscode-languageserver";

import { CompletionAcceptor, NextFeature } from "langium/lsp";

function completeForAttributeSnippets(next: NextFeature, acceptor: CompletionAcceptor) {
  // if (next.property === "name") {
  //   acceptor({
  //     label: "attribute",
  //     kind: CompletionItemKind.Snippet,
  //     detail: "Basic internal association",
  //     sortText: "100",
  //     insertText: "${1:name}: ${2:type}",
  //     insertTextFormat: InsertTextFormat.Snippet,
  //   });

  //   acceptor({
  //     label: "complete-attribute",
  //     kind: CompletionItemKind.Snippet,
  //     detail: "Basic internal association",
  //     sortText: "100",
  //     insertText: "${1:name}: ${2:type} [${3:*}] { $4 }",
  //     insertTextFormat: InsertTextFormat.Snippet,
  //   });
  // }
}

export { completeForAttributeSnippets };
