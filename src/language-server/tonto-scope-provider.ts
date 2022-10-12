import { DefaultScopeProvider } from "langium";

/**
 * Special scope provider that matches symbol names regardless of lowercase or uppercase.
 */
export class TontoScopeProvider extends DefaultScopeProvider {}
