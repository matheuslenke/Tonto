
import { CompletionItemKind, InsertTextFormat } from "vscode-languageserver";

import { CompletionAcceptor, CompletionContext, NextFeature } from "langium/lsp";

function completeForGenSetSnippets(context: CompletionContext, next: NextFeature, acceptor: CompletionAcceptor) {
    acceptor(context, {
      label: "genset",
      kind: CompletionItemKind.Snippet,
      detail: "Basic internal association",
      sortText: "100",
      insertText: ["genset ${1:name} {", "\tgeneral ${2:Superclass}", "\tspecifics ${3:Subclass}", "}"].join("\n"),
      insertTextFormat: InsertTextFormat.Snippet,
    });

    acceptor(context, {
      label: "complete-genset",
      kind: CompletionItemKind.Snippet,
      detail: "Basic internal association",
      sortText: "100",
      insertText: ["complete genset ${1:name} {", "\tgeneral ${2:Superclass}", "\tspecifics ${3:Subclass}", "}"].join(
        "\n"
      ),
      insertTextFormat: InsertTextFormat.Snippet,
    });

    acceptor(context, {
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
