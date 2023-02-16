import { ErrorResultResponse, ResultResponse } from "./cli/ontoumljsValidator";
import * as vscode from "vscode";
import * as path from "path";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import { validateAction } from "./cli/actions/validateAction";
import { importCommand } from "./cli/actions/importAction";
import { generateAction } from "./cli/actions/generateAction";

let client: LanguageClient;
let generateJsonStatusBarItem: vscode.StatusBarItem;
let generateTontoStatusBarItem: vscode.StatusBarItem;
let validationStatusBarItem: vscode.StatusBarItem;

// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext): void {
  createJSONGenerationCommands(context);
  createTontoGenerationCommands(context);
  createValidationCommands(context);
  client = startLanguageClient(context);
}

// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
  if (client) {
    return client.stop();
  }
  return undefined;
}

function startLanguageClient(context: vscode.ExtensionContext): LanguageClient {
  const serverModule = context.asAbsolutePath(
    path.join("out", "language-server", "main")
  );
  // The debug options for the server
  // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
  // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
  const debugOptions = { execArgv: ["--nolazy", `--inspect${process.env.DEBUG_BREAK ? "-brk" : ""}=${process.env.DEBUG_SOCKET || "6009"}`] };
  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  const fileSystemWatcher = vscode.workspace.createFileSystemWatcher(
    "**/*.tonto"
  );
  context.subscriptions.push(fileSystemWatcher);

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "tonto" }],
    synchronize: {
      // Notify the server about file changes to files contained in the workspace
      fileEvents: fileSystemWatcher,
    },
  };

  // Create the language client and start the client.
  const client = new LanguageClient(
    "tonto",
    "Tonto",
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the
  client.start();
  return client;
}

function createTontoGenerationCommands(context: vscode.ExtensionContext) {
  const myCommandId = "extension.generateTonto";
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
        await generateTonto(uri);
      }
    })
  );

  // create a new status bar item that we can now manage
  generateTontoStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    49
  );
  generateTontoStatusBarItem.command = myCommandId;
  context.subscriptions.push(generateTontoStatusBarItem);

  // register some listener that make sure the status bar
  // item always up-to-date
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateTontoStatusBarItem)
  );
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(updateTontoStatusBarItem)
  );

  // update status bar item once at start
  updateTontoStatusBarItem();
}

function createJSONGenerationCommands(context: vscode.ExtensionContext) {
  const myCommandId = "extension.generateJSON";
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
        await generateJson(uri);
      }
    })
  );

  // create a new status bar item that we can now manage
  generateJsonStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  generateJsonStatusBarItem.command = myCommandId;
  context.subscriptions.push(generateJsonStatusBarItem);

  // register some listener that make sure the status bar
  // item always up-to-date
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateJsonStatusBarItem)
  );
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(updateJsonStatusBarItem)
  );

  // update status bar item once at start
  updateJsonStatusBarItem();
}
function createValidationCommands(context: vscode.ExtensionContext) {
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
  validationStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    48
  );
  validationStatusBarItem.command = myCommandId;
  context.subscriptions.push(validationStatusBarItem);

  // register some listener that make sure the status bar
  // item always up-to-date
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateValidationStatusBarItem)
  );
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(updateValidationStatusBarItem)
  );

  // update status bar item once at start
  updateValidationStatusBarItem();
}

function updateJsonStatusBarItem(): void {
  generateJsonStatusBarItem.text = "$(bracket-dot) Generate JSON from Model";
  generateJsonStatusBarItem.show();
}

function updateTontoStatusBarItem(): void {
  generateTontoStatusBarItem.text = "$(keybindings-sort) Generate Tonto";
  generateTontoStatusBarItem.show();
}
function updateValidationStatusBarItem(): void {
  validationStatusBarItem.text = "$(check-all) Validate Model";
  validationStatusBarItem.show();
}

async function generateJson(uri: vscode.Uri) {
  if (uri.scheme == "file") {
    vscode.workspace.openTextDocument(uri).then(async (document) => {
      if (document.languageId === "tonto") {
        const destination = path.join(path.dirname(uri.fsPath), "generated");
        generateAction(document.fileName, {
          destination: destination,
        });
        vscode.window.showInformationMessage("JSON File generated");
      } else {
        vscode.window.showInformationMessage(
          "Failed! File needs to have the .tonto extension"
        );
      }
    });
  }
}

async function generateTonto(uri: vscode.Uri) {
  if (uri.scheme == "file") {
    vscode.workspace.openTextDocument(uri).then(async (document) => {
      if (document.languageId === "json") {
        const destination = path.dirname(uri.fsPath);
        const result = await importCommand(document.fileName, {
          destination: destination,
        });
        if (result.success) {
          vscode.window.showInformationMessage(`Success! ${result.message}`);
        } else {
          vscode.window.showInformationMessage(`Error! ${result.message}`);
        }
      } else {
        vscode.window.showInformationMessage("Failed! File is not a JSON");
      }
    });
  }
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
            const error = (result as unknown) as ErrorResultResponse;
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
