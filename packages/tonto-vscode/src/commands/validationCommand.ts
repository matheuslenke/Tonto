import { validateCommand } from "tonto-cli/src/cli/actions";
import * as vscode from "vscode";
import { CommandIds } from "./commandIds";
import chalk from "chalk";
import { ResultResponse, ErrorResultResponse } from "tonto-cli/src/cli/requests/ontoumljsValidator";

function createValidationSatusBarItem(
  context: vscode.ExtensionContext,
  statusBarItem: vscode.StatusBarItem,
  outputChannel: vscode.OutputChannel
) {
  context.subscriptions.push(
    vscode.commands.registerCommand(CommandIds.validateTontoFromButton, () => {
      createStatusBarItemValidateTontoCommand(outputChannel);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(CommandIds.validateTonto, () => {
      createValidateTontoCommand(outputChannel);
    })
  );

  createStatusBarItem(context, statusBarItem);
}

function createStatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
  // create a new status bar item that we can now manage
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 48);
  statusBarItem.command = CommandIds.validateTontoFromButton;
  context.subscriptions.push(statusBarItem);

  // register some listener that make sure the status bar
  // item always up-to-date
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      updateValidationStatusBarItem(statusBarItem);
    })
  );
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(() => {
      updateValidationStatusBarItem(statusBarItem);
    })
  );

  // update status bar item once at start
  updateValidationStatusBarItem(statusBarItem);
}

function updateValidationStatusBarItem(statusBarItem: vscode.StatusBarItem): void {
  statusBarItem.text = "$(check-all) Validate Model";
  statusBarItem.show();
}

async function createStatusBarItemValidateTontoCommand(outputChannel: vscode.OutputChannel) {
  const editor = vscode.window.activeTextEditor;
  let uri: vscode.Uri | undefined;
  const documentUri = editor?.document.uri;
  if (documentUri) {
    uri = documentUri;
  } else {
    const currentRoot = vscode.workspace.workspaceFolders?.[0]?.uri;
    if (currentRoot) {
      uri = currentRoot;
    }
  }

  if (uri) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (workspaceFolder) {
      await validateModel(workspaceFolder.uri, outputChannel);
    } else {
      vscode.window.showErrorMessage("Failed! File needs to be in a workspace");
    }
  } else {
    vscode.window.showErrorMessage("Failed! Could not find workspace to execute validation");
  }
}

async function createValidateTontoCommand(outputChannel: vscode.OutputChannel) {
  const directoryUri = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: "Select Tonto Project directory",
  });

  if (directoryUri && directoryUri[0]) {
    const selectedFolder = directoryUri[0];
    await validateModel(selectedFolder, outputChannel);
  } else {
    vscode.window.showErrorMessage("Failed! Not a valid directory selected");
  }
}

async function validateModel(directoryUri: vscode.Uri, outputChannel: vscode.OutputChannel) {
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Validating model...",
      cancellable: false,
    },
    async () => {
      const response = await validateCommand(directoryUri.fsPath);

      if (Array.isArray(response)) {
        outputChannel.clear();
        const resultResponses = response as ResultResponse[];
        if (resultResponses.length === 0) {
          vscode.window.showInformationMessage("Validation successful! No errors found.");
        } else {
          resultResponses.forEach((resultResponse) => {
            outputChannel.appendLine(chalk.bold.redBright(`[${resultResponse.severity}] ${resultResponse.title}:`));
            outputChannel.appendLine(chalk.red(resultResponse.description));
          });
          outputChannel.show();
        }
      } else if (isErrorResultResponse(response)) {
        const error = response as ErrorResultResponse;
        vscode.window.showErrorMessage(error.message ?? "Error validating model");
      }
    }
  );
}

function isErrorResultResponse(
  response: void | ErrorResultResponse | ResultResponse[]
): response is ErrorResultResponse {
  return (response as ErrorResultResponse).info !== undefined;
}

export { createValidationSatusBarItem, isErrorResultResponse };
