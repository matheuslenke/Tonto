import * as path from "path";
import * as vscode from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from "vscode-languageclient/node.js";
import { createTransformToGufoSatusBarItem } from "../commands/gufoTransformCommand.js";
import { createInitCommand } from "../commands/initCommand.js";
import { createGenerateJsonStatusBarItem } from "../commands/JsonGenerationCommands.js";
import { createTontoGenerationStatusBarItem } from "../commands/TontoGenerationCommand.js";
import { createTpmInstallCommands } from "../commands/TpmInstallCommand.js";
import { createValidationSatusBarItem } from "../commands/validationCommand.js";
import { activateDiagram } from "../diagram/activateDiagram.js";
import { setOutputChannel } from "./outputChannel.js";
import { TontoLibraryFileSystemProvider } from "./TontoLibraryFileSystemProvider.js";

// Commands to show inside the `tontoCommandsExplorer` view
const TONTO_EXPLORER_COMMANDS = [
    "tonto.generateJSON",
    "tonto.generateTonto",
    "tonto.validateModel",
    "tonto.transformModel",
    "tonto.tpm.install",
    "tonto.initProject",
];

class TontoCommandItem extends vscode.TreeItem {
    constructor(public override readonly id: string, label: string) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.contextValue = "tontoCommand";
        this.command = {
            command: id,
            title: label,
            arguments: [],
        };
    }
}

class TontoCommandsProvider implements vscode.TreeDataProvider<TontoCommandItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TontoCommandItem | undefined | void> = new vscode.EventEmitter();
    readonly onDidChangeTreeData: vscode.Event<TontoCommandItem | undefined | void> = this._onDidChangeTreeData.event;

    getTreeItem(element: TontoCommandItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TontoCommandItem): Thenable<TontoCommandItem[]> {
        if (element) {
            return Promise.resolve([]);
        }
        const items = TONTO_EXPLORER_COMMANDS.map(cmd => new TontoCommandItem(cmd, this.titleFor(cmd)));
        return Promise.resolve(items);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    private titleFor(cmd: string): string {
        switch (cmd) {
            case "tonto.generateJSON":
                return "Generate JSON";
            case "tonto.generateTonto":
                return "Generate Tonto";
            case "tonto.validateModel":
                return "Validate Model";
            case "tonto.transformModel":
                return "Transform to GUFO";
            case "tonto.tpm.install":
                return "Install Packages (TPM)";
            case "tonto.initProject":
                return "Init new Tonto project";
            default:
                return cmd;
        }
    }
}

let languageClient: LanguageClient;
let generateTontoStatusBarItem!: vscode.StatusBarItem;
let generateJsonStatusBarItem!: vscode.StatusBarItem;
let generateDiagramStatusBarItem!: vscode.StatusBarItem;
let validateStatusBarItem!: vscode.StatusBarItem;
let transformToGufoStatusBarItem!: vscode.StatusBarItem;
let tpmInstallStatusBarItem!: vscode.StatusBarItem;
let outputChannel!: vscode.OutputChannel;



// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext): void {
    outputChannel = vscode.window.createOutputChannel("Tonto logs");
    // expose this shared output channel to other modules
    setOutputChannel(outputChannel);
    TontoLibraryFileSystemProvider.register(context);
    languageClient = startLanguageClient(context);

    createGenerateJsonStatusBarItem(context, generateJsonStatusBarItem);
    createTontoGenerationStatusBarItem(context, generateTontoStatusBarItem);
    createValidationSatusBarItem(context, validateStatusBarItem, outputChannel);
    createTransformToGufoSatusBarItem(context, transformToGufoStatusBarItem);
    createTpmInstallCommands(context, tpmInstallStatusBarItem);
    createInitCommand(context, outputChannel);
    activateDiagram(context, languageClient);

    // Register a TreeDataProvider for the `tontoCommandsExplorer` view so commands
    // appear as items inside the primary Sidebar view instead of as top-bar buttons.
    const commandsProvider = new TontoCommandsProvider();
    const treeView = vscode.window.createTreeView("tontoCommandsExplorer", {
        treeDataProvider: commandsProvider,
        showCollapseAll: false,
    });
    context.subscriptions.push(treeView);

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
    const serverModule = context.asAbsolutePath(path.join("pack", "language", "main.cjs"));
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
