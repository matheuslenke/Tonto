import { Module, PartialLangiumSharedServices, startLanguageServer } from "langium";
import { NodeFileSystem } from "langium/node";
import { createConnection, ProposedFeatures } from "vscode-languageserver/node";
import { TontoSharedServices, createTontoServices } from "tonto-cli";
import { TontoGrammarWorkspaceManager } from "./tonto-workspace-manager";

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

export const LangiumGrammarSharedModule: Module<TontoSharedServices, PartialLangiumSharedServices> = {
  workspace: {
    WorkspaceManager: (services) => new TontoGrammarWorkspaceManager(services)
  }
};

// Inject the shared services and language-specific services
const { shared } = createTontoServices({
  connection,
  ...NodeFileSystem,
});

// Start the language server with the shared services
startLanguageServer(shared);
