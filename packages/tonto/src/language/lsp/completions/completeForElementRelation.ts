// import { CompletionItemKind } from "vscode-languageserver";
// import { InsertTextFormat } from "vscode-languageserver-types";
// import { completeForCardinality } from "./completeForCardinality.js";

import { CompletionAcceptor, NextFeature } from "langium/lsp";

function completeForElementRelation(keyword: NextFeature, acceptor: CompletionAcceptor) {
  // switch (keyword.value) {
  //   case "--":
  //     acceptor({
  //       label: "-- $relationName --",
  //       kind: CompletionItemKind.Snippet,
  //       detail: "Association",
  //       insertTextFormat: InsertTextFormat.Snippet,
  //       sortText: "10",
  //     });
  //     acceptor({
  //       label: "--",
  //       kind: CompletionItemKind.Keyword,
  //       detail: "Association",
  //       sortText: "1",
  //     });
  //     break;
  //   case "<>--":
  //     acceptor({
  //       label: "<>-- $relationName --",
  //       kind: CompletionItemKind.Snippet,
  //       detail: "Composition",
  //       sortText: "10",
  //       insertTextFormat: InsertTextFormat.Snippet,
  //     });
  //     acceptor({
  //       label: "<>--",
  //       kind: CompletionItemKind.Keyword,
  //       detail: "Association",
  //       sortText: "1",
  //     });
  //     break;
  //   case "[":
  //     completeForCardinality(acceptor);
  //     break;
  //   case "(":
  //     acceptor({
  //       label: "( $endName )",
  //       kind: CompletionItemKind.Snippet,
  //       detail: "End name",
  //       sortText: "10",
  //       insertTextFormat: InsertTextFormat.Snippet,
  //     });
  //     acceptor({
  //       label: "( { ${1:const} } ${2:endName} )",
  //       kind: CompletionItemKind.Snippet,
  //       detail: "Complete end name",
  //       sortText: "10",
  //       insertTextFormat: InsertTextFormat.Snippet,
  //     });
  //     break;
  // }
}

export { completeForElementRelation };
