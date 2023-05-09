import {
  AstNode,
  DefaultWorkspaceManager,
  FileSystemNode,
  LangiumDocument,
  LangiumDocumentFactory,
  LangiumSharedServices,
} from "langium";
import { WorkspaceFolder } from "vscode-languageserver";
import { URI, Utils } from "vscode-uri";
import { basicDataTypes } from "./builtins/basicDataTypes";

export class TontoWorkspaceManager extends DefaultWorkspaceManager {
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
  protected async loadAdditionalDocuments(
    folders: WorkspaceFolder[],
    collector: (document: LangiumDocument<AstNode>) => void
  ): Promise<void> {
    const uri = URI.parse("builtin://basicDatatypes.tonto");
    const document = this.documentFactory.fromString(this.basicDataTypes, uri);
    collector(document);
  }

  /**
   * Determine whether the given folder entry shall be included while indexing the workspace.
   */
  protected includeEntry(
    workspaceFolder: WorkspaceFolder,
    entry: FileSystemNode,
    fileExtensions: string[]
  ): boolean {
    const name = Utils.basename(entry.uri);
    if (name.startsWith(".")) {
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
