import "reflect-metadata";

import { configureDefaultCommands, GlspVscodeConnector, SocketGlspVscodeServer } from "@eclipse-glsp/vscode-integration";
import * as path from "path";
import * as vscode from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from "vscode-languageclient/node.js";
import { GLSP_PORT_COMMAND, MODELSERVER_PORT_COMMAND } from "../../../tonto/src/glsp-server/index.js";
import { createGenerateJsonStatusBarItem } from "../commands/JsonGenerationCommands.js";
import { createTontoGenerationStatusBarItem } from "../commands/TontoGenerationCommand.js";
import { createTpmInstallCommands } from "../commands/TpmInstallCommand.js";
import { createTransformToGufoSatusBarItem } from "../commands/gufoTransformCommand.js";
import { createValidationSatusBarItem } from "../commands/validationCommand.js";
import { TontoLibraryFileSystemProvider } from "./TontoLibraryFileSystemProvider.js";
import TontoEditorProvider from "./tonto-editor-provider.js";

let languageClient: LanguageClient;
let generateTontoStatusBarItem: vscode.StatusBarItem;
let generateJsonStatusBarItem: vscode.StatusBarItem;
let generateDiagramStatusBarItem: vscode.StatusBarItem;
let validateStatusBarItem: vscode.StatusBarItem;
let transformToGufoStatusBarItem: vscode.StatusBarItem;
let tpmInstallStatusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

// const DEFAULT_SERVER_PORT = "0";

// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext): void {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
        // if no workspace is open, we do not need to start our servers
        return;
    }
    outputChannel = vscode.window.createOutputChannel("Tonto: Validation output");
    TontoLibraryFileSystemProvider.register(context);
    languageClient = startLanguageClient(context);
    // createConfigurationCommands(context);
    createGenerateJsonStatusBarItem(context, generateJsonStatusBarItem);
    createTontoGenerationStatusBarItem(context, generateTontoStatusBarItem);
    // createGenerateDiagramStatusBarItem(context, generateDiagramStatusBarItem);
    createValidationSatusBarItem(context, validateStatusBarItem, outputChannel);
    createTransformToGufoSatusBarItem(context, transformToGufoStatusBarItem, outputChannel);
    createTpmInstallCommands(context, tpmInstallStatusBarItem);
    // activateDiagram(context, languageClient);
    activateGLSPServer(context);
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
    const languageClient = new LanguageClient("tonto", "Tonto", serverOptions, clientOptions);

    // Start the client. This will also launch the extension
    languageClient.start();
    console.log("Tonto language client started");
    vscode.commands.registerCommand(MODELSERVER_PORT_COMMAND, () => languageClient.sendRequest(MODELSERVER_PORT_COMMAND));
    vscode.commands.registerCommand(GLSP_PORT_COMMAND, () => languageClient.sendRequest(GLSP_PORT_COMMAND));
    return languageClient;
}

function activateGLSPServer(context: vscode.ExtensionContext): void {
    const tontoGlspServer = new SocketGlspVscodeServer({
        clientId: "glsp.tonto",
        clientName: "tonto",
        connectionOptions: {
            port: Number(process.env.TONTO_SERVER_PORT) ?? 0
        }
    });

    console.log(tontoGlspServer.initializeResult);
    tontoGlspServer.onServerMessage((e) => {
        console.log("Received message!");
    });

    const glspVscodeConnector = new GlspVscodeConnector({
        server: tontoGlspServer,
        logging: true
    });


    const customEditorProvider = vscode.window.registerCustomEditorProvider(
        "tonto.glspDiagram",
        new TontoEditorProvider(context, glspVscodeConnector),
        {
            webviewOptions: { retainContextWhenHidden: true },
            supportsMultipleEditorsPerDocument: false
        }
    );
    context.subscriptions.push(customEditorProvider);
    configureDefaultCommands({ extensionContext: context, connector: glspVscodeConnector, diagramPrefix: "tonto" });
}

function createClientOptions(context: vscode.ExtensionContext): LanguageClientOptions {

    const tontoWatcher = vscode.workspace.createFileSystemWatcher("**/*.tonto");
    // Watch changes in tonto.json as it contains the dependencies
    const packageWatcher = vscode.workspace.createFileSystemWatcher("**/tonto.json");
    const directoryWatcher = vscode.workspace.createFileSystemWatcher("**/*/");

    context.subscriptions.push(tontoWatcher, packageWatcher, directoryWatcher);

    return {
        documentSelector: [
            { scheme: "file", language: "tonto" },
            { scheme: "file", pattern: "**/tonto.json" }
        ],
        synchronize: {
            // Notify the server about file changes to files contained in the workspace
            fileEvents: [tontoWatcher, packageWatcher, directoryWatcher],
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

// function createServerModules(): ContainerModule[] {
//     const appModule = createAppModule({ logLevel: vscode.LogLevel.info, logDir: LOG_DIR, fileLog: true, consoleLog: false });
//     const elkLayoutModule = configureELKLayoutModule({ algorithms: ["layered"], layoutConfigurator: WorkflowLayoutConfigurator });
//     const mainModule = new WorkflowServerModule().configureDiagramModule(new WorkflowDiagramModule(() => GModelStorage), elkLayoutModule);
//     return [appModule, mainModule];
// }
