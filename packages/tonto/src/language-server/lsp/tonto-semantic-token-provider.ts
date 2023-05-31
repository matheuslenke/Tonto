import {
  AbstractSemanticTokenProvider,
  AstNode,
  SemanticTokenAcceptor,
} from "langium";
import {
  SemanticTokenModifiers,
  SemanticTokenTypes,
} from "vscode-languageserver";
import {
  DataType,
  isAttribute,
  isClassDeclaration,
  isContextModule,
  isDataType,
  isElementRelation,
  isEnumElement,
  isOntologicalCategory,
  OntologicalCategory,
} from "../generated/ast";
import {
  Attribute,
  ClassDeclaration,
  ContextModule,
  ElementRelation,
  EnumElement,
  isRelationMetaAttribute,
  RelationMetaAttribute,
} from "./../generated/ast";

/*
 * This SemanticTokenProvider extension is made so we can create our own SemanticToken
 * definitions for the members of the Tonto AST
 */
export class TontoSemanticTokenProvider extends AbstractSemanticTokenProvider {
  protected highlightElement(
    node: AstNode,
    acceptor: SemanticTokenAcceptor
  ): void {
    if (isContextModule(node)) {
      this.contextModuleTokens(node, acceptor);
    }
    if (isClassDeclaration(node)) {
      this.classElementTokens(node, acceptor);
    }
    if (isOntologicalCategory(node)) {
      this.ontologicalCategoryTokens(node, acceptor);
    }
    if (isAttribute(node)) {
      this.attributeTokens(node, acceptor);
    }
    if (isElementRelation(node)) {
      this.elementRelationTokens(node, acceptor);
    }
    if (isDataType(node) && node.isEnum) {
      this.enumTokens(node, acceptor);
    }
    if (isEnumElement(node)) {
      this.enumElementTokens(node, acceptor);
    }
    if (isRelationMetaAttribute(node)) {
      this.relationMetaAttributeTokens(node, acceptor);
    }
  }

  /*
   * ---- HELPERS ----
   */

  private contextModuleTokens(
    node: ContextModule,
    acceptor: SemanticTokenAcceptor
  ) {
    acceptor({
      node,
      property: "name",
      type: SemanticTokenTypes.namespace,
    });
  }

  private classElementTokens(
    node: ClassDeclaration,
    acceptor: SemanticTokenAcceptor
  ) {
    acceptor({
      node,
      property: "name",
      type: SemanticTokenTypes.class,
      modifier: SemanticTokenModifiers.declaration,
    });
    acceptor({
      node,
      property: "specializationEndurants",
      type: SemanticTokenTypes.variable,
    });
  }

  private ontologicalCategoryTokens(
    node: OntologicalCategory,
    acceptor: SemanticTokenAcceptor
  ) {
    acceptor({
      node,
      property: "ontologicalCategory",
      type: SemanticTokenTypes.decorator,
    });
  }

  private attributeTokens(node: Attribute, acceptor: SemanticTokenAcceptor) {
    acceptor({
      node,
      property: "attributeTypeRef",
      type: SemanticTokenTypes.type,
    });
    acceptor({
      node,
      property: "name",
      type: SemanticTokenTypes.property,
      modifier: SemanticTokenModifiers.declaration,
    });
  }

  private elementRelationTokens(
    node: ElementRelation,
    acceptor: SemanticTokenAcceptor
  ) {
    acceptor({
      node,
      property: "relationType",
      type: SemanticTokenTypes.class,
    });
    acceptor({
      node,
      property: "name",
      type: SemanticTokenTypes.variable,
    });
    acceptor({
      node,
      property: "firstEndName",
      type: SemanticTokenTypes.variable,
    });
    acceptor({
      node,
      property: "secondEndName",
      type: SemanticTokenTypes.variable,
    });
    acceptor({
      node,
      property: "firstEndMetaAttributes",
      type: SemanticTokenTypes.property,
    });
  }
  private relationMetaAttributeTokens(
    node: RelationMetaAttribute,
    acceptor: SemanticTokenAcceptor
  ) {
    acceptor({
      node,
      property: "subsetRelation",
      type: SemanticTokenTypes.variable,
    });
  }

  private enumTokens(node: DataType, acceptor: SemanticTokenAcceptor) {
    acceptor({
      node,
      property: "name",
      type: SemanticTokenTypes.enum,
    });
  }

  private enumElementTokens(
    node: EnumElement,
    acceptor: SemanticTokenAcceptor
  ) {
    acceptor({
      node,
      property: "name",
      type: SemanticTokenTypes.enumMember,
    });
  }
}
