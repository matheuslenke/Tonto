import * as path from "path";
import * as vscode from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from "vscode-languageclient/node.js";
import { createGenerateJsonStatusBarItem } from "../commands/JsonGenerationCommands.js";
import { createTontoGenerationStatusBarItem } from "../commands/TontoGenerationCommand.js";
import { createTpmInstallCommands } from "../commands/TpmInstallCommand.js";
import { createTransformToGufoSatusBarItem } from "../commands/gufoTransformCommand.js";
import { createValidationSatusBarItem } from "../commands/validationCommand.js";
import { activateDiagram } from "../diagram/activateDiagram.js";
import { TontoLibraryFileSystemProvider } from "./TontoLibraryFileSystemProvider.js";

let languageClient: LanguageClient;
let generateTontoStatusBarItem: vscode.StatusBarItem;
let generateJsonStatusBarItem: vscode.StatusBarItem;
let generateDiagramStatusBarItem: vscode.StatusBarItem;
let validateStatusBarItem: vscode.StatusBarItem;
let transformToGufoStatusBarItem: vscode.StatusBarItem;
let tpmInstallStatusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext): void {
    outputChannel = vscode.window.createOutputChannel("Tonto: Validation output");
    TontoLibraryFileSystemProvider.register(context);
    languageClient = startLanguageClient(context);
    // createConfigurationCommands(context);
    createGenerateJsonStatusBarItem(context, generateJsonStatusBarItem);
    createTontoGenerationStatusBarItem(context, generateTontoStatusBarItem);
    // createGenerateDiagramStatusBarItem(context, generateDiagramStatusBarItem);
    createValidationSatusBarItem(context, validateStatusBarItem, outputChannel);
    createTransformToGufoSatusBarItem(context, transformToGufoStatusBarItem);
    createTpmInstallCommands(context, tpmInstallStatusBarItem);
    activateDiagram(context, languageClient);

    context.subscriptions.push(
        vscode.commands.registerCommand("catCoding.start", () => {
            // Create and show a new webview
            const panel = vscode.window.createWebviewPanel(
                "catCoding", // Identifies the type of the webview. Used internally
                "Cat Coding", // Title of the panel displayed to the user
                vscode.ViewColumn.One, // Editor column to show the new webview panel in.
                {} // Webview options. More on these later.
            );
            panel.webview.html = getWebviewContent();
        })
    );
}

function getWebviewContent() {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cat Coding</title>
  </head>
  <body>
      <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
  </body>
  </html>`;
}

// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
    if (languageClient) {
        return languageClient.stop();
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
    const serverOptions: ServerOptions = createServerOptions(context);
    const clientOptions: LanguageClientOptions = createClientOptions(context);
    // Create the language client and start the client.
    const client = new LanguageClient("tonto", "Tonto", serverOptions, clientOptions);

    // Start the client. This will also launch the extension
    client.start();

    return client;
}

function createClientOptions(context: vscode.ExtensionContext): LanguageClientOptions {
    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher("**/*.tonto");
    context.subscriptions.push(fileSystemWatcher);

    const directoryWatcher = vscode.workspace.createFileSystemWatcher("**/*/");
    context.subscriptions.push(directoryWatcher);
    return {
        documentSelector: [{ scheme: "file", language: "tonto" }],
        synchronize: {
            // Notify the server about file changes to files contained in the workspace
            fileEvents: fileSystemWatcher,
        },
    };
}

function createServerOptions(context: vscode.ExtensionContext): ServerOptions {
    const serverModule = context.asAbsolutePath(path.join("out", "language", "main.cjs"));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
    // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
    const debugOptions = {
        execArgv: ["--nolazy", `--inspect${process.env.DEBUG_BREAK ? "-brk" : ""}=${process.env.DEBUG_SOCKET || "6009"}`],
    };
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    return {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions,
        },
    };
}
