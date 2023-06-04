import { NextFeature, CompletionAcceptor } from "langium";
import { AbstractElement } from "langium/lib/grammar/generated/ast";
import { CompletionItemKind } from "vscode-languageserver";
import { InsertTextFormat } from "vscode-languageserver-types";

function completeForEnumSnippets(next: NextFeature<AbstractElement>, acceptor: CompletionAcceptor) {
  acceptor({
    label: "enum",
    kind: CompletionItemKind.Snippet,
    detail: "Basic internal association",
    sortText: "100",
    insertText: ["enum ${1:name} {", "$2", "}"].join("\n"),
    insertTextFormat: InsertTextFormat.Snippet,
  });
}

export { completeForEnumSnippets };
