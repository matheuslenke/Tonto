import { NextFeature, CompletionAcceptor } from "langium";
import { AbstractElement } from "langium/lib/grammar/generated/ast";
import { CompletionItemKind } from "vscode-languageserver";
import { InsertTextFormat } from "vscode-languageserver";

function completeForGenSetSnippets(next: NextFeature<AbstractElement>, acceptor: CompletionAcceptor) {
  acceptor({
    label: "genset",
    kind: CompletionItemKind.Snippet,
    detail: "Basic internal association",
    sortText: "100",
    insertText: ["genset ${1:name} {", "\tgeneral ${2:Superclass}", "\tspecifics ${3:Subclass}", "}"].join("\n"),
    insertTextFormat: InsertTextFormat.Snippet,
  });

  acceptor({
    label: "complete-genset",
    kind: CompletionItemKind.Snippet,
    detail: "Basic internal association",
    sortText: "100",
    insertText: ["complete genset ${1:name} {", "\tgeneral ${2:Superclass}", "\tspecifics ${3:Subclass}", "}"].join(
      "\n"
    ),
    insertTextFormat: InsertTextFormat.Snippet,
  });

  acceptor({
    label: "disjoint-complete-genset",
    kind: CompletionItemKind.Snippet,
    detail: "Basic internal association",
    sortText: "100",
    insertText: [
      "disjoint complete genset ${1:name} {",
      "\tgeneral ${2:Superclass}",
      "\tspecifics ${3:Subclass}",
      "}",
    ].join("\n"),
    insertTextFormat: InsertTextFormat.Snippet,
  });
}

export { completeForGenSetSnippets };
