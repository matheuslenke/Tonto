/******************************************************************************
 * This file was generated by langium-cli 3.0.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

import type { LangiumGeneratedCoreServices, LangiumGeneratedSharedCoreServices, LanguageMetaData, Module } from 'langium';
import type { LangiumSharedServices, LangiumServices } from 'langium/lsp';
import { TontoAstReflection } from './ast.js';
import { TontoGrammar } from './grammar.js';

export const TontoLanguageMetaData = {
    languageId: 'tonto',
    fileExtensions: ['.tonto'],
    caseInsensitive: false
} as const satisfies LanguageMetaData;

export const TontoGeneratedSharedModule: Module<LangiumSharedServices, LangiumGeneratedSharedCoreServices> = {
    AstReflection: () => new TontoAstReflection()
};

export const TontoGeneratedModule: Module<LangiumServices, LangiumGeneratedCoreServices> = {
    Grammar: () => TontoGrammar(),
    LanguageMetaData: () => TontoLanguageMetaData,
    parser: {}
};
