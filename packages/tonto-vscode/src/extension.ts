import * as vscode from "vscode";
import * as path from "path";
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from "vscode-languageclient/node";
import { TontoLibraryFileSystemProvider } from "./extension/TontoLibraryFileSystemProvider";
import { createTontoGenerationStatusBarItem } from "./commands/TontoGenerationCommand";
import { createGenerateJsonStatusBarItem } from "./commands/JsonGenerationCommands";
import { createValidationSatusBarItem } from "./commands/validationCommand";
import { createTransformToGufoSatusBarItem } from "./commands/gufoTransformCommand";
import { createTpmInstallCommands } from "./commands/TpmInstallCommand";
import { createGenerateDiagramStatusBarItem } from "./commands/DiagramGenerationCommands";

let client: LanguageClient;
let generateTontoStatusBarItem: vscode.StatusBarItem;
let generateJsonStatusBarItem: vscode.StatusBarItem;
let generateDiagramStatusBarItem: vscode.StatusBarItem;
let validateStatusBarItem: vscode.StatusBarItem;
let transformToGufoStatusBarItem: vscode.StatusBarItem;
let tpmInstallStatusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext): void {

  /*
  context.subscriptions.push(vscode.commands.registerCommand('extension.openSettings', () => {
    vscode.commands.executeCommand('workbench.action.openSettings', 'tonto');
  }));
  */

  outputChannel = vscode.window.createOutputChannel("Tonto: Validation output");
  TontoLibraryFileSystemProvider.register(context);
  client = startLanguageClient(context);
  createGenerateJsonStatusBarItem(context, generateJsonStatusBarItem);
  createTontoGenerationStatusBarItem(context, generateTontoStatusBarItem);
  createGenerateDiagramStatusBarItem(context, generateDiagramStatusBarItem);
  createValidationSatusBarItem(context, validateStatusBarItem, outputChannel);
  createTransformToGufoSatusBarItem(context, transformToGufoStatusBarItem);
  createTpmInstallCommands(context, tpmInstallStatusBarItem);
}

// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
  if (client) {
    return client.stop();
  }
  validateStatusBarItem.dispose();
  generateJsonStatusBarItem.dispose();
  generateDiagramStatusBarItem.dispose();
  tpmInstallStatusBarItem.dispose();
  generateTontoStatusBarItem.dispose();
  transformToGufoStatusBarItem.dispose();
  return undefined;
}

function startLanguageClient(context: vscode.ExtensionContext): LanguageClient {
  const serverModule = context.asAbsolutePath(path.join("out", "language-server", "main"));
  // The debug options for the server
  // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
  // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
  const debugOptions = {
    execArgv: ["--nolazy", `--inspect${process.env.DEBUG_BREAK ? "-brk" : ""}=${process.env.DEBUG_SOCKET || "6009"}`],
  };
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

  const fileSystemWatcher = vscode.workspace.createFileSystemWatcher("**/*.tonto");

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
  const client = new LanguageClient("tonto", "Tonto", serverOptions, clientOptions);

  // Start the client. This will also launch the extension
  client.start();

  return client;
}
