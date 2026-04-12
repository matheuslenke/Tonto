import { AstNode, MaybePromise } from "langium";
import { AstNodeHoverProvider } from "langium/lsp";
import { Hover } from "vscode-languageserver";
import { isClassDeclaration } from "../generated/ast.js";
import { TontoServices } from "../tonto-module.js";
import { buildClassDeclarationHoverMarkdown } from "./tonto-hover-content.js";
export class TontoHoverProvider extends AstNodeHoverProvider {
    constructor(services: TontoServices) {
        super(services);
    }

    protected override getAstNodeHoverContent(node: AstNode): MaybePromise<Hover | undefined> {
        if (isClassDeclaration(node)) {
            return {
                contents: {
                    kind: "markdown",
                    value: buildClassDeclarationHoverMarkdown(node),
                }
            };
        }
        return undefined;
    }
}
