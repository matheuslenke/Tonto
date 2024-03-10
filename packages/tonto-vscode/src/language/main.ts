import { Module } from "langium";
import { PartialLangiumSharedServices, startLanguageServer } from "langium/lsp";
import { NodeFileSystem } from "langium/node";
import { createTontoServices, TontoSharedServices } from "tonto-cli";
import { createConnection, ProposedFeatures } from "vscode-languageserver/node.js";
import { TontoGrammarWorkspaceManager } from "./tonto-workspace-manager.js";

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

export const TontoSharedModule: Module<TontoSharedServices, PartialLangiumSharedServices> = {
  workspace: {
    WorkspaceManager: (services) => new TontoGrammarWorkspaceManager(services)
  }
};

// Inject the shared services and language-specific services
const { shared } = createTontoServices({
  connection,
  ...NodeFileSystem
},
  TontoSharedModule);

// Start the language server with the shared services
startLanguageServer(shared);
