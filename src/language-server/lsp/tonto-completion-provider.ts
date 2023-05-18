import {
  AstNode,
  CompletionAcceptor,
  CompletionContext,
  DefaultCompletionProvider,
  MaybePromise,
  NextFeature,
} from "langium";
import * as ast from "langium/lib/grammar/generated/ast";
import { completeForCardinality } from "./completions/completeForCardinality";
import { completeForElementRelation } from "./completions/completeForElementRelation";
import { completeForEnumSnippets } from "./completions/completeForEnumSnippets";
import { completeForAttributeSnippets } from "./completions/completeForAttribute";
import { completeForDataType } from "./completions/completeForDatatype";
import {
  completeFullElementRelationSnippets,
  completeFullExternalElementRelationSnippets,
} from "./completions/completeFullElementRelationSnippets";
import { completeForGenSetSnippets } from "./completions/completeForGenSet";
import { isParserRule } from "langium/lib/grammar/generated/ast";

export class TontoCompletionProvider extends DefaultCompletionProvider {
  protected async completionForRule(
    context: CompletionContext,
    rule: ast.AbstractRule,
    acceptor: CompletionAcceptor
  ): Promise<void> {
    return super.completionForRule(context, rule, acceptor);
  }

  protected completionFor(
    context: CompletionContext,
    next: NextFeature<ast.AbstractElement>,
    acceptor: CompletionAcceptor
  ): MaybePromise<void> {
    // Completion for Cardinality in any context
    if (
      ast.isKeyword(next.feature) &&
      next.type === "Cardinality" &&
      next.feature.value === "["
    ) {
      completeForCardinality(acceptor);
    }

    if (ast.isKeyword(next.feature)) {
      switch (next.type) {
        case "Enum":
          completeForEnumSnippets(next, acceptor);
          break;

        case "ComplexDataType":
          completeForDataType(next, acceptor);
          break;

        case "Attribute":
          completeForAttributeSnippets(next, acceptor);
          break;

        case "ElementRelation":
          completeForElementRelation(next.feature, acceptor);
          if (ast.isKeyword(next.feature) && next.feature.value === "@") {
            if (this.isInternalRelation(next.feature.$container)) {
              completeFullElementRelationSnippets(acceptor);
            } else if (this.isExternalRelation(next.feature.$container)) {
              completeFullExternalElementRelationSnippets(acceptor);
            }
          }
          break;

        case "GeneralizationSet":
          if (ast.isKeyword(next.feature) && next.feature.value === "genset") {
            completeForGenSetSnippets(next, acceptor);
          }
          break;
      }
    }

    return super.completionFor(context, next, acceptor);
  }

  protected completionForKeyword(
    context: CompletionContext,
    keyword: ast.Keyword,
    acceptor: CompletionAcceptor
  ): MaybePromise<void> {
    // This part gets at what part of the elementRelation the cursor is at
    // and sugests the correct completion
    // this.completeForElementRelation(keyword, acceptor);
    return super.completionForKeyword(context, keyword, acceptor);
  }

  protected completionForCrossReference(
    context: CompletionContext,
    crossRef: NextFeature<ast.CrossReference>,
    acceptor: CompletionAcceptor
  ): MaybePromise<void> {
    return super.completionForCrossReference(context, crossRef, acceptor);
  }

  private isInternalRelation(container: AstNode): boolean {
    if (!container) {
      return false;
    }

    if (isParserRule(container) && container.name === "InternalRelation") {
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
    if (isParserRule(container) && container.name === "ExternalRelation") {
      return true;
    }
    if (container.$container) {
      return this.isExternalRelation(container.$container);
    }
    return false;
  }
}
