import {
  CompletionAcceptor,
  CompletionContext,
  DefaultCompletionProvider,
  MaybePromise,
  NextFeature,
} from "langium";
import * as ast from "langium/lib/grammar/generated/ast";
import { isClassDeclaration } from "../generated/ast";
import { completeForCardinality } from "./completions/completeForCardinality";
import { completeForElementRelation } from "./completions/completeForElementRelation";
import { completeForEnumSnippets } from "./completions/completeForEnumSnippets";
import { completeForAttributeSnippets } from "./completions/completeForAttribute";
import { completeForDataType } from "./completions/completeForDatatype";

export class TontoCompletionProvider extends DefaultCompletionProvider {
  protected async completionForRule(
    context: CompletionContext,
    rule: ast.AbstractRule,
    acceptor: CompletionAcceptor
  ): Promise<void> {
    // console.log(context.node?.$type);
    // console.log(rule.name);
    // if (ast.isParserRule(rule)) {
    //   console.log("parserRule");
    //   console.log(rule.name);
    // }
    // if (ast.isTerminalRule(rule)) {
    //   console.log(rule.name);
    // }
    return super.completionForRule(context, rule, acceptor);
  }

  protected completionFor(
    context: CompletionContext,
    next: NextFeature<ast.AbstractElement>,
    acceptor: CompletionAcceptor
  ): MaybePromise<void> {
    // This is to get snippets inside the scope of a classDeclaration
    if (
      isClassDeclaration(context.node) ||
      isClassDeclaration(context.node?.$container)
    ) {
      switch (next.type) {
        case "Attribute":
          completeForAttributeSnippets(next, acceptor);
          break;
        case "ElementRelation":
          if (ast.isKeyword(next.feature)) {
            completeForElementRelation(next.feature, acceptor);
          }
          break;
        case "Cardinality":
          if (ast.isKeyword(next.feature) && next.feature.value === "[") {
            completeForCardinality(acceptor);
          }
          break;
      }
    }
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
}
