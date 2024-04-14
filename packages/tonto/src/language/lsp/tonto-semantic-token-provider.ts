

import { AstNode, CstUtils } from "langium";
import { AbstractSemanticTokenProvider, AllSemanticTokenModifiers, SemanticTokenAcceptor, SemanticTokenRangeOptions } from "langium/lsp";
import { SemanticTokenModifiers, SemanticTokenTypes } from "vscode-languageserver";
import * as ast from "../generated/ast.js";
import { TontoSemanticTokenTypes } from "./semantic-token-types.js";
/*
 * This SemanticTokenProvider extension is made so we can create our own SemanticToken
 * definitions for the members of the Tonto AST
 */
export class TontoSemanticTokenProvider extends AbstractSemanticTokenProvider {
    protected override highlightToken(options: SemanticTokenRangeOptions): void {
        const { range, type } = options;
        let modifiers = options.modifier;
        if ((this.currentRange && !CstUtils.inRange(range, this.currentRange)) || !this.currentDocument || !this.currentTokensBuilder) {
            return;
        }
        const intType = TontoSemanticTokenTypes[type];
        let totalModifier = 0;
        if (modifiers !== undefined) {
            if (typeof modifiers === "string") {
                modifiers = [modifiers];
            }
            for (const modifier of modifiers) {
                const intModifier = AllSemanticTokenModifiers[modifier];
                totalModifier |= intModifier;
            }
        }
        const startLine = range.start.line;
        const endLine = range.end.line;
        if (startLine === endLine) {
            // Token only spans a single line
            const char = range.start.character;
            const length = range.end.character - char;
            this.currentTokensBuilder.push(startLine, char, length, intType, totalModifier);
        } else if (this.clientCapabilities?.multilineTokenSupport) {
            // Let token span multiple lines
            const startChar = range.start.character;
            const startOffset = this.currentDocument.textDocument.offsetAt(range.start);
            const endOffset = this.currentDocument.textDocument.offsetAt(range.end);
            this.currentTokensBuilder.push(startLine, startChar, endOffset - startOffset, intType, totalModifier);
        } else {
            // Token spans multiple lines, but the client doesn't support it
            // Split the range into multiple semantic tokens
            const firstLineStart = range.start;
            let nextLineOffset = this.currentDocument.textDocument.offsetAt({
                line: startLine + 1,
                character: 0
            });
            // Build first line
            this.currentTokensBuilder.push(
                firstLineStart.line,
                firstLineStart.character,
                nextLineOffset - firstLineStart.character - 1,
                intType,
                totalModifier
            );
            // Build all lines in between first and last
            for (let i = startLine + 1; i < endLine; i++) {
                const currentLineOffset = nextLineOffset;
                nextLineOffset = this.currentDocument.textDocument.offsetAt({
                    line: i + 1,
                    character: 0
                });
                this.currentTokensBuilder.push(
                    i,
                    0,
                    nextLineOffset - currentLineOffset - 1,
                    intType, totalModifier
                );
            }
            // Build last line
            this.currentTokensBuilder.push(
                endLine,
                0,
                range.end.character,
                intType,
                totalModifier
            );
        }
    }
    protected highlightElement(node: AstNode, acceptor: SemanticTokenAcceptor): void {
        if (ast.isContextModule(node)) {
            this.contextModuleTokens(node, acceptor);
        }
        if (ast.isClassDeclaration(node)) {
            this.classElementTokens(node, acceptor);
        }
        if (ast.isAttribute(node)) {
            this.attributeTokens(node, acceptor);
        }
        if (ast.isElementRelation(node)) {
            this.elementRelationTokens(node, acceptor);
        }
        if (ast.isDataType(node)) {
            this.datatypeTokens(node, acceptor);
        }
        if (ast.isDataType(node) && node.isEnum) {
            this.enumTokens(node, acceptor);
        }
        if (ast.isEnumElement(node)) {
            this.enumElementTokens(node, acceptor);
        }
        if (ast.isRelationMetaAttributes(node)) {
            this.relationMetaAttributesTokens(node, acceptor);
        }
        if (ast.isRelationMetaAttribute(node)) {
            this.relationMetaAttributeTokens(node, acceptor);
        }
        if (ast.isGeneralizationSet(node)) {
            this.generalizationSetTokens(node, acceptor);
        }
    }

    datatypeTokens(node: ast.DataType, acceptor: SemanticTokenAcceptor) {
        acceptor({
            node,
            property: "ontologicalCategory",
            type: SemanticTokenTypes.type,
            modifier: "bold"
        });
    }

    /*
   * ---- HELPERS ----
   */

    private contextModuleTokens(node: ast.ContextModule, acceptor: SemanticTokenAcceptor) {
        acceptor({
            node,
            property: "name",
            type: SemanticTokenTypes.namespace,
        });
    }

    private classElementTokens(node: ast.ClassDeclaration, acceptor: SemanticTokenAcceptor) {
        acceptor({
            node,
            property: "name",
            type: SemanticTokenTypes.class,
            modifier: SemanticTokenModifiers.declaration,
            keyword: "ClassTonto"
        });
        acceptor({
            node,
            property: "specializationEndurants",
            type: SemanticTokenTypes.variable,
        });
        this.ontologicalCategoryTokens(node, node.classElementType, acceptor);
    }

    private ontologicalCategoryTokens(container: ast.ClassDeclaration, node: ast.OntologicalCategory, acceptor: SemanticTokenAcceptor) {
        if (node.ontologicalCategory === "kind") {
            acceptor({
                node,
                property: "ontologicalCategory",
                type: "tontoKind",
            });
        } else if (node.ontologicalCategory === "relator") {
            acceptor({
                node,
                property: "ontologicalCategory",
                type: "tontoRelator"
            });
        } else if (node.ontologicalCategory === "quality") {
            acceptor({
                node,
                property: "ontologicalCategory",
                type: "tontoQuality"
            });
        } else if (node.ontologicalCategory === "quantity") {
            acceptor({
                node,
                property: "ontologicalCategory",
                type: "tontoQuantity"
            });
        } else if (node.ontologicalCategory === "collective") {
            acceptor({
                node,
                property: "ontologicalCategory",
                type: "tontoCollective"
            });
        } else if (node.ontologicalCategory === "event") {
            acceptor({
                node,
                property: "ontologicalCategory",
                type: "tontoEvent"
            });
        } else if (node.ontologicalCategory === "mode" || node.ontologicalCategory === "intrinsicMode" || node.ontologicalCategory === "extrinsicMode") {
            acceptor({
                node,
                property: "ontologicalCategory",
                type: "tontoMode"
            });
        } else if (node.ontologicalCategory === "situation") {
            acceptor({
                node,
                property: "ontologicalCategory",
                type: "tontoSituation"
            });
        } else if (node.ontologicalCategory === "type") {
            acceptor({
                node,
                property: "ontologicalCategory",
                type: "tontoType"
            });
        } else if (node.ontologicalCategory === "subkind") {
            acceptor({
                node,
                property: "ontologicalCategory",
                type: "tontoObjects"
            });
        }
    }

    private attributeTokens(node: ast.Attribute, acceptor: SemanticTokenAcceptor) {
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

    private elementRelationTokens(node: ast.ElementRelation, acceptor: SemanticTokenAcceptor) {
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
            property: "firstEndMetaAttributes",
            type: SemanticTokenTypes.property,
        });
    }

    private relationMetaAttributesTokens(node: ast.RelationMetaAttributes, acceptor: SemanticTokenAcceptor) {
        acceptor({
            node,
            property: "endName",
            type: SemanticTokenTypes.variable,
        });
    }

    private relationMetaAttributeTokens(node: ast.RelationMetaAttribute, acceptor: SemanticTokenAcceptor) {
        acceptor({
            node,
            property: "subsetRelation",
            type: SemanticTokenTypes.variable,
        });
    }

    private enumTokens(node: ast.DataType, acceptor: SemanticTokenAcceptor) {
        acceptor({
            node,
            property: "name",
            type: SemanticTokenTypes.enum,
        });
    }

    private enumElementTokens(node: ast.EnumElement, acceptor: SemanticTokenAcceptor) {
        acceptor({
            node,
            property: "name",
            type: SemanticTokenTypes.enumMember,
        });
    }

    private generalizationSetTokens(node: ast.GeneralizationSet, acceptor: SemanticTokenAcceptor) {
        acceptor({
            node,
            property: "name",
            type: SemanticTokenTypes.variable,
        });
    }
}
