import {
  DefaultScopeProvider
} from "langium";

/**
 * Special scope provider that matches symbol names regardless of lowercase or uppercase.
 */
export class TontoScopeProvider extends DefaultScopeProvider {
  // TODO: Review Scope
  // override getScope(context: ReferenceInfo): Scope {
  //   try {
  //     const scopes: Array<Stream<AstNodeDescription>> = [];
  //     const referenceType = this.reflection.getReferenceType(context);
  
  //     const precomputed = getDocument(context.container).precomputedScopes;
  //     if (precomputed) {
  //       let currentNode: AstNode | undefined = context.container;
  //       do {
  //         const allDescriptions = precomputed.get(currentNode);
  //         if (allDescriptions.length > 0) {
  //           scopes.push(stream(allDescriptions).filter((desc) => this.reflection.isSubtype(desc.type, referenceType)));
  //         }
  //         currentNode = currentNode.$container;
  //       } while (currentNode);
  //     }
  
  //     let result: Scope = this.getGlobalScope(referenceType, context);
  //     for (let i = scopes.length - 1; i >= 0; i--) {
  //       result = this.createScope(scopes[i], result);
  //     }
  //     return result;
  //   }
  //   catch (error) {
  //     const result: Scope = this.createScopeForNodes([]);
  //     return this.createScope([], result);
  //   }
  // }
}
