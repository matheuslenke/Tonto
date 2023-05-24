import { validateCommand } from "tonto-cli/src/cli/actions";
import { ErrorResultResponse, ResultResponse } from "tonto-cli/src/cli/ontoumljsValidator";
import * as vscode from "vscode";
import { CommandIds } from "./commandIds";
import chalk from "chalk";

function createValidationSatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
  context.subscriptions.push(
    vscode.commands.registerCommand(CommandIds.validateTontoFromButton, createStatusBarItemValidateTontoCommand)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(CommandIds.validateTonto, createValidateTontoCommand)
  );

  createStatusBarItem(context, statusBarItem);
}

function createStatusBarItem(context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem) {
  // create a new status bar item that we can now manage
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    48
  );
  statusBarItem.command = CommandIds.validateTontoFromButton;
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

async function createStatusBarItemValidateTontoCommand(uri: vscode.Uri) {
  const editor = vscode.window.activeTextEditor;
  if (!uri) {
    const documentUri = editor?.document.uri;
    if (documentUri) {
      uri = documentUri;
    }
  }

  if (uri) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (workspaceFolder) {
      await validateModel(workspaceFolder.uri);
    } else {
      vscode.window.showErrorMessage("Failed! File needs to be in a workspace");
    }
  }
}

async function createValidateTontoCommand() {
  const directoryUri = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: "Select Tonto Project directory"
  });

  if (directoryUri && directoryUri[0]) {
    const selectedFolder = directoryUri[0];
    await validateModel(selectedFolder);
  } else {
    vscode.window.showErrorMessage("Failed! Not a valid directory selected");
  }
}

async function validateModel(directoryUri: vscode.Uri) {
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: "Validating model...",
    cancellable: false
  }, async () => {
    const response = await validateCommand(directoryUri.fsPath);

    const outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel("Tonto: Validation output");

    if (Array.isArray(response)) {
      const resultResponses = response as ResultResponse[];
      resultResponses.forEach((resultResponse) => {
        outputChannel.appendLine(chalk.bold.redBright(`[${resultResponse.severity}] ${resultResponse.title}:`));
        outputChannel.appendLine(chalk.red(resultResponse.description));
      });
      outputChannel.show();
    } else {
      const error = response as ErrorResultResponse;
      vscode.window.showErrorMessage(error.message ?? "Error validating model");
    }
  });
}

function isErrorResultResponse(
  response: void | ErrorResultResponse | ResultResponse[]
): response is ErrorResultResponse {
  return (response as ErrorResultResponse).info !== undefined;
}

export { createValidationSatusBarItem, isErrorResultResponse };