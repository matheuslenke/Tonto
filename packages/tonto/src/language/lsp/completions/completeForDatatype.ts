import { CompletionAcceptor, CompletionContext, NextFeature } from "langium/lsp";
import { CompletionItemKind } from "vscode-languageserver";
import { InsertTextFormat } from "vscode-languageserver-types";

function completeForDataType(context: CompletionContext, next: NextFeature, acceptor: CompletionAcceptor) {
    acceptor(context, {
      label: "basic-datatype",
      kind: CompletionItemKind.Snippet,
      detail: "Basic Datatype",
      sortText: "100",
      insertText: ["datatype ${1:name} {", "$2", "}"].join("\n"),
      insertTextFormat: InsertTextFormat.Snippet,
    });
    acceptor(context, {
      label: "nature-datatype",
      kind: CompletionItemKind.Snippet,
      detail: "Datatype with Ontological Nature",
      sortText: "100",
      insertText: ["datatype ${1:name} of ${2:nature} {", "$2", "}"].join("\n"),
      insertTextFormat: InsertTextFormat.Snippet,
    });
}

export { completeForDataType };
