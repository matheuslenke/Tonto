import { CompletionAcceptor, CompletionContext } from "langium/lsp";
import { CompletionItemKind } from "vscode-languageserver";
import { InsertTextFormat } from "vscode-languageserver-types";

export function completeFullElementRelationSnippets(
    context: CompletionContext,
    acceptor: CompletionAcceptor) {
    acceptor(context, {
      label: "basic-internal-association",
      kind: CompletionItemKind.Snippet,
      detail: "Basic internal association",
      sortText: "102",
      insertText: "[${1:*}] -- ${2:relationName} -- [${3:*}] ${4:DeclarationName}",
      insertTextFormat: InsertTextFormat.Snippet,
    });
    acceptor(context, {
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
    acceptor(context, {
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
    acceptor(context, {
      label: "basic-internal-aggregation",
      kind: CompletionItemKind.Snippet,
      detail: "Basic internal aggregation",
      sortText: "102",
      insertText: "[${1:*}] <>-- ${2:relationName} -- [${3:*}] ${4:DeclarationName}",
      insertTextFormat: InsertTextFormat.Snippet,
    });
    acceptor(context, {
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
    acceptor(context, {
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

export function completeFullExternalElementRelationSnippets(
    context: CompletionContext,
    acceptor: CompletionAcceptor) {
  acceptor(context, {
    label: "basic-external-association",
    kind: CompletionItemKind.Snippet,
    detail: "Basic external association",
    sortText: "102",
    insertText: "relation ${1:Reference} [${2:*}] -- ${3:relationName} -- [${4:*}] ${5:DeclarationName}",
    insertTextFormat: InsertTextFormat.Snippet,
  });
  acceptor(context, {
    label: "external-association",
    kind: CompletionItemKind.Snippet,
    detail: "external association",
    sortText: "101",
    insertText: [
      "@${1:relationStereotype}",
      "relation ${2:Reference} (${3:firstEndName}) [${4:*}] -- ${5:relationName} -- [${6:*}] (${7:secondEndName}) ${8:DeclarationName}",
    ].join("\n"),
    insertTextFormat: InsertTextFormat.Snippet,
  });
  acceptor(context, {
    label: "full-external-association",
    kind: CompletionItemKind.Snippet,
    detail: "Full external association",
    sortText: "103",
    insertText: [
      "@${1:stereotype}",
      "relation ${2:Reference} ({ ${3:metaAttributes} } ${4:firstEndName}) [${5:1}] -- ${6:relationName} -- [${7:1}] ({${8:metaAttributes}} ${9:secondEndName}) ${10:Reference}",
    ].join("\n"),
    insertTextFormat: InsertTextFormat.Snippet,
  });
  acceptor(context, {
    label: "basic-external-aggregation",
    kind: CompletionItemKind.Snippet,
    detail: "Basic external aggregation",
    sortText: "102",
    insertText: "relation ${1:Reference} [${2:*}] <>-- ${3:relationName} -- [${4:*}] ${5:DeclarationName}",
    insertTextFormat: InsertTextFormat.Snippet,
  });
  acceptor(context, {
    label: "external-aggregation",
    kind: CompletionItemKind.Snippet,
    detail: "external aggregation",
    sortText: "101",
    insertText: [
      "@${1:relationStereotype}",
      "relation ${2:Reference} (${3:firstEndName}) [${4:*}] <>-- ${5:relationName} -- [${6:*}] (${7:secondEndName}) ${8:DeclarationName}",
    ].join("\n"),
    insertTextFormat: InsertTextFormat.Snippet,
  });
  acceptor(context, {
    label: "full-internal-aggregation",
    kind: CompletionItemKind.Snippet,
    detail: "Full internal aggregation",
    sortText: "103",
    insertText: [
      "@${1:stereotype}",
      "relation ${2:Reference} ({ ${3:metaAttributes} } ${4:firstEndName}) [${5:1}] <>-- ${6:relationName} -- [${7:1}] ({${8:metaAttributes}} ${9:secondEndName}) ${10:Reference}",
    ].join("\n"),
    insertTextFormat: InsertTextFormat.Snippet,
  });
}
