
import { AstNode, AstNodeDescription, AstUtils, DefaultScopeComputation, interruptAndCheck, LangiumDocument, MultiMap, PrecomputedScopes } from "langium";
import { CancellationToken } from "vscode-jsonrpc";
import {
    ContextModule,
    ElementRelation,
    isClassDeclaration,
    isContextModule,
    isDataType,
    isElementRelation,
    isEnumElement,
    isGeneralizationSet,
    Model,
} from "../generated/ast.js";
import { getModelImports, getPrimaryContextModule } from "../utils/modelStatements.js";
import { TontoServices } from "../tonto-module.js";
import { TontoQualifiedNameProvider } from "./tonto-name-provider.js";

export class TontoScopeComputation extends DefaultScopeComputation {
    qualifiedNameProvider: TontoQualifiedNameProvider;

    constructor(services: TontoServices) {
        super(services);
        this.qualifiedNameProvider = services.references.QualifiedNameProvider;
    }

    /**
   * Computes all scopes for the given document in order to export it globally. In Tonto,
   * this is done only for ContextModules that are global
   * @param document
   * @param cancelToken
   * @returns An array of AstNodeDescriptions
   */
    override async computeExports(
        document: LangiumDocument,
        cancelToken = CancellationToken.None
    ): Promise<AstNodeDescription[]> {
        const descr: AstNodeDescription[] = [];
        for (const childNode of AstUtils.streamAllContents(document.parseResult.value)) {
            await interruptAndCheck(cancelToken);

            /**
             * Export element Relations with their qualified name if they are in a
             * ContextModule and the ContextModule is global.
             */
            if (isElementRelation(childNode)) {
                const contextModule = this.getContextModuleFromContainer(childNode);
                let name: string | undefined;

                if (isClassDeclaration(childNode.$container) || isElementRelation(childNode.$container)) {
                    name = this.qualifiedNameProvider.getName(childNode);
                } else {
                    name = childNode.name;
                }
                if (name && contextModule.isGlobal) descr.push(this.descriptions.createDescription(childNode, name, document));
            }

            if (
                isClassDeclaration(childNode) ||
                isDataType(childNode) ||
                isContextModule(childNode) ||
                isGeneralizationSet(childNode)
            ) {
                if (isContextModule(childNode.$container) && childNode.$container.isGlobal) {
                    descr.push(this.descriptions.createDescription(childNode, childNode.name, document));
                } else if (isContextModule(childNode) && !childNode.isGlobal) {
                    if (childNode.name !== undefined) {
                        const fullyQualifiedName = this.qualifiedNameProvider.getName(childNode);

                        descr.push(this.descriptions.createDescription(childNode, fullyQualifiedName, document));
                    }
                }
            }
        }
        return descr;
    }

    /**
   * Compute all the local scopes for the given document
   * @param document the current document
   * @param cancelToken
   * @returns PrecomputedScopes
   */
    override async computeLocalScopes(
        document: LangiumDocument<AstNode>,
        cancelToken = CancellationToken.None
    ): Promise<PrecomputedScopes> {
        const model = document.parseResult.value as Model;
        const scopes = new MultiMap<AstNode, AstNodeDescription>();
        const contextModule = getPrimaryContextModule(model);

        if (!contextModule) {
            return scopes;
        }

        for (const importItem of getModelImports(model)) {
            const contextModule = importItem.referencedModel?.ref;
            if (contextModule) {
                await this.processContainer(contextModule, scopes, document, cancelToken);
            }
        }
        await this.processContainer(contextModule, scopes, document, cancelToken);

        const otherAstNodeDescriptions: AstNodeDescription[] = [];
        scopes.forEach((scope, key) => {
            if (isContextModule(key)) {
                if (key.name !== contextModule.name) {
                    otherAstNodeDescriptions.push(scope);
                }
            }
        });

        scopes.addAll(contextModule, otherAstNodeDescriptions);

        return scopes;
    }

    private async processContainer(
        container: ContextModule,
        scopes: PrecomputedScopes,
        document: LangiumDocument,
        cancelToken: CancellationToken
    ): Promise<AstNodeDescription[]> {
        const localDescriptions: AstNodeDescription[] = [];
        if (!container) {
            return localDescriptions;
        }
        for (const element of container.declarations) {
            await interruptAndCheck(cancelToken);
            if (isElementRelation(element)) {
                const qualifiedName = this.qualifiedNameProvider.getQualifiedName(element);
                const name = this.qualifiedNameProvider.getName(element);
                if (name) {
                    const description = this.descriptions.createDescription(element, name, document);
                    localDescriptions.push(description);
                }
                if (qualifiedName) {
                    const descriptionQualified = this.descriptions.createDescription(element, qualifiedName, document);
                    localDescriptions.push(descriptionQualified);
                    this.exportRelationEnds(element, localDescriptions, document);
                }
            }
            if (isClassDeclaration(element) || isDataType(element) || isEnumElement(element)) {
                if (element.name !== undefined) {
                    const qualifiedName = this.qualifiedNameProvider.getQualifiedName(element);
                    const name = this.qualifiedNameProvider.getName(element);
                    const description = this.descriptions.createDescription(element, name, document);
                    const descriptionQualified = this.descriptions.createDescription(element, qualifiedName, document);
                    localDescriptions.push(description);
                    localDescriptions.push(descriptionQualified);
                    if (isClassDeclaration(element) && element.references.length > 0) {
                        for (const internalElement of element.references) {
                            if (isElementRelation(internalElement)) {
                                const qualifiedName = this.qualifiedNameProvider.getQualifiedName(internalElement);
                                const name = this.qualifiedNameProvider.getName(internalElement);
                                if (name) {
                                    const internalDescription = this.descriptions.createDescription(internalElement, name, document);
                                    localDescriptions.push(internalDescription);
                                }
                                if (qualifiedName) {
                                    const internalDescription = this.descriptions.createDescription(internalElement, qualifiedName, document);
                                    localDescriptions.push(internalDescription);
                                    this.exportRelationEnds(internalElement, localDescriptions, document);
                                }
                            }
                        }
                    }
                }
            }
        }
        scopes.addAll(container, localDescriptions);
        return localDescriptions;
    }

    private getContextModuleFromContainer(element: AstNode): ContextModule {
        let contextModule: AstNode;
        contextModule = element;
        while (contextModule.$type !== "ContextModule") {
            if (contextModule.$container === undefined) {
                break;
            }
            contextModule = contextModule.$container;
        }
        return contextModule as ContextModule;
    }

    private exportRelationEnds(relation: ElementRelation, localDescriptions: AstNodeDescription[], document: LangiumDocument) {
        const relationName = this.qualifiedNameProvider.getQualifiedName(relation);
        if (!relationName) return;

        if (relation.firstEndMetaAttributes && relation.firstEndMetaAttributes.endName) {
            const endName = relation.firstEndMetaAttributes.endName;
            localDescriptions.push(this.descriptions.createDescription(relation.firstEndMetaAttributes, endName, document));
            const qualifiedName = `${relationName}.${endName}`;
            localDescriptions.push(this.descriptions.createDescription(relation.firstEndMetaAttributes, qualifiedName, document));
        }
        if (relation.secondEndMetaAttributes && relation.secondEndMetaAttributes.endName) {
            const endName = relation.secondEndMetaAttributes.endName;
            localDescriptions.push(this.descriptions.createDescription(relation.secondEndMetaAttributes, endName, document));
            const qualifiedName = `${relationName}.${endName}`;
            localDescriptions.push(this.descriptions.createDescription(relation.secondEndMetaAttributes, qualifiedName, document));
        }
    }
}
