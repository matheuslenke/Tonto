import { CodeActionKind, Diagnostic } from "vscode-languageserver";
import { CodeActionParams } from "vscode-languageserver-protocol";
import { Command, CodeAction } from "vscode-languageserver-types";
import { LangiumDocument, MaybePromise } from "langium";
import { CodeActionProvider } from "langium";

export class TontoActionProvider implements CodeActionProvider {
  getCodeActions(document: LangiumDocument, params: CodeActionParams): MaybePromise<Array<Command | CodeAction>> {
    const result: CodeAction[] = [];
    for (const diagnostic of params.context.diagnostics) {
      const codeAction = this.createCodeAction(diagnostic, document);
      if (codeAction) {
        result.push(codeAction);
      }
    }
    return result;
  }

  private createCodeAction(diagnostic: Diagnostic, document: LangiumDocument): CodeAction | undefined {
    switch (diagnostic.code) {
      case "name_lowercase":
        return this.makeUpperCase(diagnostic, document);
      default:
        return undefined;
    }
  }

  private makeUpperCase(diagnostic: Diagnostic, document: LangiumDocument): CodeAction {
    const range = {
      start: diagnostic.range.start,
      end: {
        line: diagnostic.range.start.line,
        character: diagnostic.range.start.character + 1,
      },
    };
    return {
      title: "First letter to upper case",
      kind: CodeActionKind.QuickFix,
      diagnostics: [diagnostic],
      isPreferred: true,
      edit: {
        changes: {
          [document.textDocument.uri]: [
            {
              range,
              newText: document.textDocument.getText(range).toUpperCase(),
            },
          ],
        },
      },
    };
  }
}
