import {
  DefaultScopeProvider,
  ReferenceInfo,
  Scope,
  StreamScope,
} from "langium";

/**
 * Special scope provider that matches symbol names regardless of lowercase or uppercase.
 */
export class TontoScopeProvider extends DefaultScopeProvider {
  protected getGlobalScope(
    referenceType: string,
    _context: ReferenceInfo
  ): Scope {
    // console.log(referenceType);
    const dataTypes = new StreamScope(
      this.indexManager.allElements("ComplexDataType")
    );
    dataTypes.getAllElements().forEach((element) => {
      // console.log(element.name);
    });
    return new StreamScope(this.indexManager.allElements(referenceType));
  }
}
