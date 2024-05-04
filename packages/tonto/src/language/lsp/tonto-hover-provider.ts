import { AstNode, MaybePromise } from "langium";
import { AstNodeHoverProvider } from "langium/lsp";
import { Hover } from "vscode-languageserver";
import { isClassDeclaration } from "../generated/ast.js";
import { TontoServices } from "../tonto-module.js";
import { getTontoNature } from "../utils/getTontoNature.js";

export class TontoHoverProvider extends AstNodeHoverProvider {
    constructor(services: TontoServices) {
        super(services);
      }

    protected override getAstNodeHoverContent(node: AstNode): MaybePromise<Hover | undefined> {
       if (isClassDeclaration(node)) {
        const nature = getTontoNature(node);
        return {
            contents: {
                kind: "markdown",
                value: `Ontological Category: ${node.classElementType.ontologicalCategory}\n 
Name: ${node.name}\n
Ontological Nature: ${nature.nature}
                `
            }
        };
       }
       return undefined;
    }
}