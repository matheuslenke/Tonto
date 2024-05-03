import { SemanticTokenModifiers, SemanticTokenTypes, SemanticTokensOptions } from "vscode-languageserver";

export const TontoSemanticTokenTypes: Record<string, number> = {
    [SemanticTokenTypes.class]: 0,
    [SemanticTokenTypes.comment]: 1,
    [SemanticTokenTypes.enum]: 2,
    [SemanticTokenTypes.enumMember]: 3,
    [SemanticTokenTypes.event]: 4,
    [SemanticTokenTypes.function]: 5,
    [SemanticTokenTypes.interface]: 6,
    [SemanticTokenTypes.keyword]: 7,
    [SemanticTokenTypes.macro]: 8,
    [SemanticTokenTypes.method]: 9,
    [SemanticTokenTypes.modifier]: 10,
    [SemanticTokenTypes.namespace]: 11,
    [SemanticTokenTypes.number]: 12,
    [SemanticTokenTypes.operator]: 13,
    [SemanticTokenTypes.parameter]: 14,
    [SemanticTokenTypes.property]: 15,
    [SemanticTokenTypes.regexp]: 16,
    [SemanticTokenTypes.string]: 17,
    [SemanticTokenTypes.struct]: 18,
    [SemanticTokenTypes.type]: 19,
    [SemanticTokenTypes.typeParameter]: 20,
    [SemanticTokenTypes.variable]: 21,
    [SemanticTokenTypes.decorator]: 22,
    ["tontoKind"]: 23,
    ["tontoRelatorKind"]: 24,
    ["tontoQualityKind"]: 25,
    ["tontoQuantityKind"]: 26,
    ["tontoCollectiveKind"]: 27,
    ["tontoEvent"]: 28,
    ["tontoModeKind"]: 29,
    ["tontoMode"]: 30,
    ["tontoSituation"]: 31,
    ["tontoType"]: 32,
    ["tontoObjects"]: 33,
    ["tontoNone"]: 34,
    ["tontoFunctionalComplex"]: 35,
    ["tontoRelator"]: 36,
    ["tontoQuality"]: 37,
    ["tontoQuantity"]: 38,
    ["tontoCollective"]: 39
};

export const AllSemanticTokenModifiers: Record<string, number> = {
    [SemanticTokenModifiers.abstract]: 1 << 0,
    [SemanticTokenModifiers.async]: 1 << 1,
    [SemanticTokenModifiers.declaration]: 1 << 2,
    [SemanticTokenModifiers.defaultLibrary]: 1 << 3,
    [SemanticTokenModifiers.definition]: 1 << 4,
    [SemanticTokenModifiers.deprecated]: 1 << 5,
    [SemanticTokenModifiers.documentation]: 1 << 6,
    [SemanticTokenModifiers.modification]: 1 << 7,
    [SemanticTokenModifiers.readonly]: 1 << 8,
    [SemanticTokenModifiers.static]: 1 << 9
};

export const TontoSemanticTokenOptions: SemanticTokensOptions = {
    legend: {
        tokenTypes: Object.keys(TontoSemanticTokenTypes),
        tokenModifiers: Object.keys(AllSemanticTokenModifiers)
    },
    full: {
        delta: true
    },
    range: true
};
