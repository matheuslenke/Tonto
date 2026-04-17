import { AstNodeDescription, DefaultScopeProvider, MapScope, ReferenceInfo, Scope, ScopeOptions, StreamScope, stream } from "langium";

/**
 * Resolves both local and global symbols case-insensitively.
 *
 * Tonto treats symbol lookup the same regardless of where the symbol comes from,
 * so the case-insensitive flag must be applied when layering local scopes and
 * when consulting the shared global index.
 */
export class TontoScopeProvider extends DefaultScopeProvider {
    protected override createScope(
        elements: Iterable<AstNodeDescription>,
        outerScope?: Scope,
        options?: ScopeOptions
    ): Scope {
        return new StreamScope(stream(elements), outerScope, {
            ...options,
            caseInsensitive: true,
        });
    }

    protected override getGlobalScope(referenceType: string, _context: ReferenceInfo): Scope {
        return this.globalScopeCache.get(referenceType, () =>
            new MapScope(this.indexManager.allElements(referenceType), undefined, {
                caseInsensitive: true,
            })
        );
    }
}
