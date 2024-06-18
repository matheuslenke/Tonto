import { AstNode, GrammarAST, MaybePromise } from "langium";
import { CompletionAcceptor, CompletionContext, DefaultCompletionProvider, NextFeature } from "langium/lsp";

export class TontoCompletionProvider extends DefaultCompletionProvider {

    protected override completionFor(context: CompletionContext, next: NextFeature, acceptor: CompletionAcceptor): MaybePromise<void> {
        return super.completionFor(context, next, acceptor);
        // if (GrammarAST.isKeyword(next.feature)) {
        //     return this.completionForKeyword(context, next.feature, acceptor);
        // } else if (GrammarAST.isCrossReference(next.feature) && context.node) {
        //     return this.completionForCrossReference(context, next as NextFeature<GrammarAST.CrossReference>, acceptor);
        // }
    }

    private isInternalRelation(container: AstNode): boolean {
        if (!container) {
            return false;
        }

        if (GrammarAST.isParserRule(container) && container.name === "InternalRelation") {
            return true;
        }
        if (container.$container) {
            return this.isInternalRelation(container.$container);
        }
        return false;
    }

    private isExternalRelation(container: AstNode): boolean {
        if (!container) {
            return false;
        }
        if (GrammarAST.isParserRule(container) && container.name === "ExternalRelation") {
            return true;
        }
        if (container.$container) {
            return this.isExternalRelation(container.$container);
        }
        return false;
    }
}
