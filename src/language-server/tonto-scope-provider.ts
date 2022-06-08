
import { AstNode, AstNodeDescription, DefaultScopeProvider, EMPTY_SCOPE, getDocument, PrecomputedScopes, Scope, stream, Stream, StreamScope } from 'langium';
import {  isModel } from './generated/ast';
// import { ClassElement, ElementReference } from './generated/ast';
import { TontoServices } from './tonto-module';

/**
 * Special scope provider that matches symbol names regardless of lowercase or uppercase.
 */
export class TontoScopeProvider extends DefaultScopeProvider {

    // private CLASS_ELEMENT_TYPE = ClassElement
    // private ReferenceType = ElementReference

    constructor(services: TontoServices) {
        super(services);
    }

    /*
    * Scope creation entry function
    */
    getScope(node: AstNode, referenceId: string): Scope {
        const referenceType = this.reflection.getReferenceType(referenceId);
        const precomputed = getDocument(node).precomputedScopes;

        // Get the root container which should be the model
        let model = node.$container
        while (model && !isModel(model)) {
            model = model?.$container
        }

        if (precomputed && model) {
            // console.log(`getScope ${referenceId}: ${node.$type}`);
            // if (isClassElement(node) && referenceType == this.CLASS_ELEMENT_TYPE) {
            //     return this.getClassElements(model, precomputed)
            // }
        }
        return this.getStandardScope(node, referenceType, precomputed!)
        return EMPTY_SCOPE;
    }

    /**
     * Creates the standard scope.
     * @param node Current AstNode.
     * @param referenceType Type of the reference.
     * @param precomputed Precomputed Scope of the document.
     * @returns Scope with the elements that should be referencable.
     */
    private getStandardScope(node: AstNode, referenceType: string, precomputed: PrecomputedScopes): Scope {
            let currentNode: AstNode | undefined = node;
            // responsibilities and UCAs should have references to the nodes in the control structure
            // if ((isClassElement(node)) && referenceType == ClassElement) {
            //     const model = node.$container as Model
            //     currentNode = model.elements
            // }
    
            const allDescriptions = this.getDescriptions(currentNode, referenceType, precomputed)
            return this.descriptionsToScope(allDescriptions)
        }

    protected createScope(elements: Stream<AstNodeDescription>, outerScope: Scope): Scope {
        return new StreamScope(elements, outerScope, { caseInsensitive: true });
    }

    protected getGlobalScope(referenceType: string): Scope {
        return new StreamScope(this.indexManager.allElements(referenceType), undefined, { caseInsensitive: true });
    }

    // private getClassElements(model: Model, precomputed: PrecomputedScopes) {
    //     // const names = model.elements.
    // }
    
    /**
     * Collects node descriptions for {@code currentNode}.
     * @param currentNode AstNode for which the descriptions should be collected.
     * @param type The type the descriptions should have.
     * @param precomputed Precomputed Scope of the document.
     * @returns Descriptions of type {@code type} for {@code currentNode}.
     */
    private getDescriptions(currentNode: AstNode | undefined, type: string, precomputed: PrecomputedScopes): AstNodeDescription[] {
        let res: AstNodeDescription[] = []
        while (currentNode) {
            const allDescriptions = precomputed.get(currentNode);
            if (allDescriptions) {
                res = res.concat(allDescriptions.filter(desc => this.reflection.isSubtype(desc.type, type)))
            }
            currentNode = currentNode.$container;
        }
        return res
    }

    /**
     * Creates a scope contaning {@code descs}.
     * @param descs The node descriptions that should be contained in the Scope.
     * @returns Scope containing {@code descs}.
     */
    private descriptionsToScope(descs: AstNodeDescription[]): Scope {
        const scopes: Array<Stream<AstNodeDescription>> = []
        scopes.push(stream(descs))
        let result: Scope = EMPTY_SCOPE;
        for (let i = scopes.length - 1; i >= 0; i--) {
            result = this.createScope(scopes[i], result);
        }
        return result;
    }
}
