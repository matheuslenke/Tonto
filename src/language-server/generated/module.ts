/******************************************************************************
 * This file was generated by langium-cli 1.0.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

import { LangiumGeneratedServices, LangiumGeneratedSharedServices, LangiumSharedServices, LangiumServices, LanguageMetaData, Module } from 'langium';
import { TontoAstReflection } from './ast';
import { TontoGrammar } from './grammar';

export const TontoLanguageMetaData: LanguageMetaData = {
  languageId: 'tonto',
  fileExtensions: ['.tonto'],
  caseInsensitive: false
};

export const TontoGeneratedSharedModule: Module<LangiumSharedServices, LangiumGeneratedSharedServices> = {
  AstReflection: () => new TontoAstReflection()
};

export const TontoGeneratedModule: Module<LangiumServices, LangiumGeneratedServices> = {
  Grammar: () => TontoGrammar(),
  LanguageMetaData: () => TontoLanguageMetaData,
  parser: {}
};
