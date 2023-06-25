import { AstNode, DefaultWorkspaceManager, FileSystemNode, LangiumDocument, LangiumDocumentFactory, LangiumSharedServices } from "langium";
import { basicDataTypes } from "tonto-cli/src/language-server/workspace/builtins/basicDataTypes";
import { WorkspaceFolder } from "vscode-languageserver-protocol";
import { URI, Utils } from "vscode-uri";

export class TontoGrammarWorkspaceManager extends DefaultWorkspaceManager {
  private documentFactory: LangiumDocumentFactory;
  private basicDataTypes: string;

  constructor(services: LangiumSharedServices) {
    super(services);
    this.documentFactory = services.workspace.LangiumDocumentFactory;
    this.basicDataTypes = basicDataTypes;
  }

  /**
   * Loads built-in libraries into every Tonto Project
   */
  protected override async loadAdditionalDocuments(
    _folders: WorkspaceFolder[],
    _collector: (document: LangiumDocument<AstNode>) => void
  ): Promise<void> {
    const uri = URI.parse("builtin://basicDatatypes.tonto");
    const document = this.documentFactory.fromString(this.basicDataTypes, uri);
    _collector(document);
  }

  /**
   * Determine whether the given folder entry shall be included while indexing the workspace.
   */
  protected override includeEntry(
    workspaceFolder: WorkspaceFolder,
    entry: FileSystemNode,
    fileExtensions: string[]
  ): boolean {
    const name = Utils.basename(entry.uri);
    if (name.startsWith(".")) {
      return false;
    }
    // If the file is not from this workspace folder, it should not be included
    if (entry.uri.fsPath.startsWith(workspaceFolder.uri)) {
      return false;
    }

    if (entry.isDirectory) {
      return name !== "node_modules" && name !== "out";
    } else if (entry.isFile) {
      const extname = Utils.extname(entry.uri);
      return fileExtensions.includes(extname);
    }
    return false;
  }
}