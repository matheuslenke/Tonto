import {
  AstNode,
  DefaultWorkspaceManager,
  LangiumDocument,
  LangiumDocumentFactory,
  LangiumSharedServices,
} from "langium";
import { WorkspaceFolder } from "vscode-languageserver";
import { URI } from "vscode-uri";
import { basicDataTypes } from "./builtins/basicDataTypes";

export class TontoWorkspaceManager extends DefaultWorkspaceManager {
  private documentFactory: LangiumDocumentFactory;
  private basicDataTypes: string;

  constructor(services: LangiumSharedServices) {
    super(services);
    this.documentFactory = services.workspace.LangiumDocumentFactory;
    this.basicDataTypes = basicDataTypes;
  }

  protected async loadAdditionalDocuments(
    folders: WorkspaceFolder[],
    collector: (document: LangiumDocument<AstNode>) => void
  ): Promise<void> {
    const uri = URI.parse("builtin://basicDatatypes.tonto");
    const document = this.documentFactory.fromString(this.basicDataTypes, uri);
    collector(document);
  }
}
