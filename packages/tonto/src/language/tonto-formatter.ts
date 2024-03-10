
import { AstNode } from "langium";
import { AbstractFormatter, Formatting } from "langium/lsp";
import * as ast from "./generated/ast.js";

export class TontoFormatter extends AbstractFormatter {
  protected format(node: AstNode): void {
    if (ast.isContextModule(node)) {
      const formatter = this.getNodeFormatter(node);
      const bracesOpen = formatter.keyword("{");
      const bracesClose = formatter.keyword("}");
      formatter.interior(bracesOpen, bracesClose).prepend(Formatting.indent());
      bracesClose.prepend(Formatting.newLine());
    }
  }
}
