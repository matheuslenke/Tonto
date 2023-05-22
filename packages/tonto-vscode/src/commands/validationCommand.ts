import { validateAction } from "tonto-cli/src/cli/actions";
import { ErrorResultResponse, ResultResponse } from "tonto-cli/src/cli/ontoumljsValidator";
import * as vscode from "vscode";

function createValidationSatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
  const myCommandId = "extension.validateModel";
  context.subscriptions.push(
    vscode.commands.registerCommand(myCommandId, async (uri: vscode.Uri) => {
      const editor = vscode.window.activeTextEditor;
      if (!uri) {
        const documentUri = editor?.document.uri;
        if (documentUri) {
          uri = documentUri;
        }
      }

      if (uri) {
        await validateModel(uri);
      }
    })
  );

  // create a new status bar item that we can now manage
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    48
  );
  statusBarItem.command = myCommandId;
  context.subscriptions.push(statusBarItem);

  // register some listener that make sure the status bar
  // item always up-to-date
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => { updateValidationStatusBarItem(statusBarItem); })
  );
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(() => { updateValidationStatusBarItem(statusBarItem); })
  );

  // update status bar item once at start
  updateValidationStatusBarItem(statusBarItem);
}

function updateValidationStatusBarItem(statusBarItem: vscode.StatusBarItem): void {
  statusBarItem.text = "$(check-all) Validate Model";
  statusBarItem.show();
}

async function validateModel(uri: vscode.Uri) {
  if (uri.scheme == "file") {
    vscode.workspace.openTextDocument(uri).then(async (document) => {
      if (document.languageId === "json") {
        vscode.window.showInformationMessage("Model Validated!");
      } else if (document.languageId === "tonto") {
        const result = await validateAction(document.fileName);
        if (result) {
          if (isErrorResultResponse(result)) {
            const error = result as unknown as ErrorResultResponse;
            let message = `Error ${error.status} (${error.id}):${error.message}: \n`;
            error.info.forEach((info) => {
              message += ` keyword ${info.keyword}: ${info.message}; `;
            });
            vscode.window.showInformationMessage(message);
          } else {
            const response = result as ResultResponse[];
            const resultMessages = response.reduce(
              (oldValue, item) => oldValue + `${item.title}, `,
              ""
            );
            vscode.window.showInformationMessage(
              `Model Validated! ${resultMessages}`
            );
          }
        } else {
          vscode.window.showInformationMessage(
            "Failed! Validation request returned nothing"
          );

        }
      } else {
        vscode.window.showInformationMessage(
          "Failed! File don't have .json or .tonto extension"
        );
      }
    });
  }
}

function isErrorResultResponse(
  response: void | ErrorResultResponse | ResultResponse[]
): response is ErrorResultResponse {
  return (response as ErrorResultResponse).info !== undefined;
}

export { createValidationSatusBarItem, isErrorResultResponse };