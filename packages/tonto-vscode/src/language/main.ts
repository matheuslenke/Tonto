import { Module, PartialLangiumSharedServices, startLanguageServer } from "langium";
import { NodeFileSystem } from "langium/node";
import { createConnection, ProposedFeatures } from "vscode-languageserver/node.js";
import { TontoSharedServices, createTontoServices } from "tonto-cli";
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
