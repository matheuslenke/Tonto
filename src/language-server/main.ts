import { startLanguageServer } from "langium";
import { NodeFileSystemProvider } from "langium/lib/workspace/file-system-provider";
import { createConnection, ProposedFeatures } from "vscode-languageserver/node";
import { createTontoServices } from "./tonto-module";

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the shared services and language-specific services
const { shared } = createTontoServices({
  connection,
  ...NodeFileSystemProvider,
});

// Start the language server with the shared services
startLanguageServer(shared);
