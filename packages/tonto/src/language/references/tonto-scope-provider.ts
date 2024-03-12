import { AstNodeDescription, DefaultScopeProvider, MapScope, ReferenceInfo, Scope, ScopeOptions, StreamScope, stream } from "langium";


/**
 * Special scope provider that matches symbol names regardless of lowercase or uppercase.
 */
export class TontoScopeProvider extends DefaultScopeProvider {

  

  protected override createScope(elements: Iterable<AstNodeDescription>, outerScope?: Scope | undefined, options?: ScopeOptions | undefined): Scope {
    const scopes = new StreamScope(stream(elements), outerScope, {...options, caseInsensitive: true});
    return scopes;
    // try {
    //   const scopes: Array<Stream<AstNodeDescription>> = [];
    //   const referenceType = this.reflection.getReferenceType(context);
  
    //   const precomputed = getDocument(context.container).precomputedScopes;
    //   if (precomputed) {
    //     let currentNode: AstNode | undefined = context.container;
    //     do {
    //       const allDescriptions = precomputed.get(currentNode);
    //       if (allDescriptions.length > 0) {
    //         scopes.push(stream(allDescriptions).filter((desc) => this.reflection.isSubtype(desc.type, referenceType)));
    //       }
    //       currentNode = currentNode.$container;
    //     } while (currentNode);
    //   }
  
    //   let result: Scope = this.getGlobalScope(referenceType, context);
    //   for (let i = scopes.length - 1; i >= 0; i--) {
    //     result = this.createScope(scopes[i], result);
    //   }
    //   return result;
    // }
    // catch (error) {
    //   const result: Scope = this.createScopeForNodes([]);
    //   return this.createScope([], result);
    // }      
  }

  protected override getGlobalScope(referenceType: string, _context: ReferenceInfo): Scope {
    return this.globalScopeCache.get(referenceType, () => new MapScope(this.indexManager.allElements(referenceType), undefined, {caseInsensitive: true}));
  }
}
