import { AstNode, GrammarAST, MaybePromise } from "langium";
import { CompletionAcceptor, CompletionContext, DefaultCompletionProvider, NextFeature } from "langium/lsp";
import { completeForAttributeSnippets } from "./completions/completeForAttribute.js";
import { completeForCardinality } from "./completions/completeForCardinality.js";
import { completeForDataType } from "./completions/completeForDatatype.js";
import { completeForElementRelation } from "./completions/completeForElementRelation.js";
import { completeForEnumSnippets } from "./completions/completeForEnumSnippets.js";
import { completeForGenSetSnippets } from "./completions/completeForGenSet.js";
import { completeFullElementRelationSnippets, completeFullExternalElementRelationSnippets } from "./completions/completeFullElementRelationSnippets.js";

export class TontoCompletionProvider extends DefaultCompletionProvider {

    protected override completionFor(context: CompletionContext, next: NextFeature, acceptor: CompletionAcceptor): MaybePromise<void> {
        // Completion for Cardinality in any context
        if (GrammarAST.isKeyword(next.feature) && next.type === "Cardinality" && next.feature.value === "[") {
            completeForCardinality(context, acceptor);
        }

        if (GrammarAST.isKeyword(next.feature)) {
            switch (next.type) {
                case "Enum":
                    completeForEnumSnippets(context, next, acceptor);
                    break;

                case "ComplexDataType":
                    completeForDataType(context, next, acceptor);
                    break;

                case "Attribute":
                    completeForAttributeSnippets(context, next, acceptor);
                    break;

                case "ElementRelation":
                    completeForElementRelation(context, next, acceptor);
                    if (GrammarAST.isKeyword(next.feature) && next.feature.value === "@") {
                        if (this.isInternalRelation(next.feature.$container)) {
                            completeFullElementRelationSnippets(context, acceptor);
                        } else if (this.isExternalRelation(next.feature.$container)) {
                            completeFullExternalElementRelationSnippets(context, acceptor);
                        }
                    }
                    break;

                case "GeneralizationSet":
                    if (GrammarAST.isKeyword(next.feature) && next.feature.value === "genset") {
                        completeForGenSetSnippets(context, next, acceptor);
                    }
                    break;
            }
        }

        return super.completionFor(context, next, acceptor);
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
