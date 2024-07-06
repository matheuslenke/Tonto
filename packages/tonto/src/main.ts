import { startLanguageServer } from "langium/lsp";
import { NodeFileSystem } from "langium/node";
import "reflect-metadata";
import { createConnection, ProposedFeatures } from "vscode-languageserver/node.js";
import { URI } from "vscode-uri";
import { startGLSPServer } from "./glsp-server/app.js";
import { createTontoServices } from "./language/tonto-module.js";
import { startModelServer } from "./model-server/launch.js";

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the language services
const { shared, Tonto } = createTontoServices({ connection, ...NodeFileSystem });

// Start the language server with the language-specific services
startLanguageServer(shared);

shared.workspace.WorkspaceManager.onWorkspaceInitialized((workspaceFolders: URI[]) => {
    console.log("Started Workspace Manager");
    // Start the graphical language server with the shared services
    startGLSPServer({ shared, language: Tonto }, workspaceFolders[0]);

    // Start the JSON server with the shared services
    startModelServer({ shared, language: Tonto }, workspaceFolders[0]);
});
