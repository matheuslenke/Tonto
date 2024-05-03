import { AstNode, CstUtils } from "langium";
import { AbstractSemanticTokenProvider, AllSemanticTokenModifiers, SemanticTokenAcceptor, SemanticTokenRangeOptions } from "langium/lsp";
import { SemanticTokenModifiers, SemanticTokenTypes } from "vscode-languageserver";
import * as ast from "../generated/ast.js";
import { TontoNatures } from "../models/OntologicalCategory.js";
import { TontoSemanticTokenTypes } from "./semantic-token-types.js";

type TontoNatureResult = {
    nature: TontoNatures;
    isKind: boolean;
}

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
            type:"tontoNone",
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
        this.ontologicalCategoryTokens(node, node.classElementType, acceptor);
    }

    private getTontoNature(container: ast.ClassDeclaration): TontoNatureResult {
        switch (container.classElementType.ontologicalCategory) {
            case "kind":
                return { nature: "functional-complexes", isKind: true };
            case "collective":
                return { nature: "collectives", isKind: true };
            case "quantity":
                return { nature: "quantities", isKind: true };
            case "relator":
                return { nature: "relators", isKind: true };
            case "quality":
                return { nature: "qualities", isKind: true };
            case "mode":
            case "intrinsicMode":
            case "extrinsicMode":
                return { nature: "modes", isKind: true };
            case "type":
            case "powertype":
                return { nature: "types", isKind: false };;

            case "event":
            case "process":
                return { nature: "events", isKind: false };
            case "situation":
                return { nature: "situations", isKind: false };

            // Natures that need to be verified specializations
            case "subkind":
            case "phase":
            case "role":
            case "historicalRole":
                if (container.specializationEndurants.length > 0) {
                    let specializationNature: TontoNatures = "abstract-individuals";
                    container.specializationEndurants.forEach(item => {
                        if (item.ref && item.ref.name !== container.name) {
                            specializationNature = this.getTontoNature(item.ref).nature;
                        }
                    });
                    return { nature: specializationNature, isKind: false };;
                }
                break;
            case "category":
            case "mixin":
            case "phaseMixin":
            case "roleMixin":
            case "historicalRoleMixin":
                if (container.ontologicalNatures && container.ontologicalNatures?.natures.length > 0) {
                    const firstNature = container.ontologicalNatures.natures[0];
                    if (firstNature === "extrinsic-modes" || firstNature === "intrinsic-modes") {
                        return { nature: "modes", isKind: false };
                    }
                    return { nature: firstNature, isKind: false };
                } else if (container.specializationEndurants.length > 0) {
                    let specializationNature: TontoNatures = "abstract-individuals";
                    container.specializationEndurants.forEach(item => {
                        if (item.ref && item.ref.name !== container.name) {
                            specializationNature = this.getTontoNature(item.ref).nature;
                        }
                    });
                    return { nature: specializationNature, isKind: false };;
                }
        }
        return {nature: "none", isKind: false};
    }

    private ontologicalCategoryTokens(container: ast.ClassDeclaration, node: ast.OntologicalCategory, acceptor: SemanticTokenAcceptor) {
        const result = this.getTontoNature(container);
        const type = this.getTypeFromNature(result);
        acceptor({
            node,
            property: "ontologicalCategory",
            type: type
        });
    }

    private getTypeFromNature(nature: TontoNatureResult): string {
        switch (nature.nature) {
            case "functional-complexes":
                if (nature.isKind) return "tontoKind";
                return "tontoFunctionalComplex";
            case "relators":
                if (nature.isKind) return "tontoRelatorKind";
                return "tontoRelator";
            case "qualities":
                if (nature.isKind) return "tontoQualityKind";
                return "tontoQuality";
            case "quantities":
                if (nature.isKind) return "tontoQuantityKind";
                return "tontoQuantity";
            case "collectives":
                if (nature.isKind) return "tontoCollectiveKind";
                return "tontoCollective";
            case "modes":
                if (nature.isKind) return "tontoModeKind";
                return "tontoMode";
            case "events":
                return "tontoEvent";
            case "situations":
                return "tontoSituation";
            case "types":
                return "tontoType";
        }
        return "tontoNone";
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
            property: "isEnum",
            type: "tontoNone",
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
    }
}
