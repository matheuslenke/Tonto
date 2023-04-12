import { CompletionAcceptor } from "langium";
import { CompletionItemKind } from "vscode-languageserver";
import { InsertTextFormat } from "vscode-languageserver-types";

function completeFullElementRelationSnippets(acceptor: CompletionAcceptor) {
  acceptor({
    label: "basic-internal-association",
    kind: CompletionItemKind.Snippet,
    detail: "Basic internal association",
    sortText: "102",
    insertText:
      "[${1:*}] -- ${2:relationName} -- [${3:*}] ${4:DeclarationName}",
    insertTextFormat: InsertTextFormat.Snippet,
  });
  acceptor({
    label: "internal-association",
    kind: CompletionItemKind.Snippet,
    detail: "internal association",
    sortText: "101",
    insertText: [
      "@${1:relationStereotype}",
      "(${2:firstEndName}) [${3:*}] -- ${4:relationName} -- [${5:*}] (${6:secondEndName}) ${7:DeclarationName}",
    ].join("\n"),
    insertTextFormat: InsertTextFormat.Snippet,
  });
  acceptor({
    label: "full-internal-association",
    kind: CompletionItemKind.Snippet,
    detail: "Full internal association",
    sortText: "103",
    insertText: [
      "@${1:stereotype}",
      "({ ${2:metaAttributes} } ${3:firstEndName}) [${4:1}] -- ${5:relationName} -- [${6:1}] ({${7:metaAttributes}} ${8:secondEndName}) ${9:Reference}",
    ].join("\n"),
    insertTextFormat: InsertTextFormat.Snippet,
  });
  acceptor({
    label: "basic-internal-aggregation",
    kind: CompletionItemKind.Snippet,
    detail: "Basic internal aggregation",
    sortText: "102",
    insertText:
      "[${1:*}] <>-- ${2:relationName} -- [${3:*}] ${4:DeclarationName}",
    insertTextFormat: InsertTextFormat.Snippet,
  });
  acceptor({
    label: "internal-aggregation",
    kind: CompletionItemKind.Snippet,
    detail: "internal aggregation",
    sortText: "101",
    insertText: [
      "@${1:relationStereotype}",
      "(${2:firstEndName}) [${3:*}] <>-- ${4:relationName} -- [${5:*}] (${7:secondEndName}) ${6:DeclarationName}",
    ].join("\n"),
    insertTextFormat: InsertTextFormat.Snippet,
  });
  acceptor({
    label: "full-internal-aggregation",
    kind: CompletionItemKind.Snippet,
    detail: "Full internal aggregation",
    sortText: "103",
    insertText: [
      "@${1:stereotype}",
      "({ ${2:metaAttributes} } ${3:firstEndName}) [${4:1}] <>-- ${5:relationName} -- [${6:1}] ({${7:metaAttributes}} ${8:secondEndName}) ${9:Reference}",
    ].join("\n"),
    insertTextFormat: InsertTextFormat.Snippet,
  });
}

export { completeFullElementRelationSnippets };
