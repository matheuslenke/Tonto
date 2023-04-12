import { NextFeature, CompletionAcceptor } from "langium";
import { AbstractElement } from "langium/lib/grammar/generated/ast";
import { CompletionItemKind } from "vscode-languageserver";
import { InsertTextFormat } from "vscode-languageserver-types";

function completeForDataType(
  next: NextFeature<AbstractElement>,
  acceptor: CompletionAcceptor
) {
  acceptor({
    label: "basic-datatype",
    kind: CompletionItemKind.Snippet,
    detail: "Basic Datatype",
    sortText: "100",
    insertText: ["datatype ${1:name} {", "$2", "}"].join("\n"),
    insertTextFormat: InsertTextFormat.Snippet,
  });
  acceptor({
    label: "nature-datatype",
    kind: CompletionItemKind.Snippet,
    detail: "Datatype with Ontological Nature",
    sortText: "100",
    insertText: ["datatype ${1:name} of ${2:nature} {", "$2", "}"].join("\n"),
    insertTextFormat: InsertTextFormat.Snippet,
  });
}

export { completeForDataType };
