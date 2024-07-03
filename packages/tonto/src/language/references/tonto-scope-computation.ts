
import { AstNode, AstNodeDescription, AstUtils, DefaultScopeComputation, interruptAndCheck, LangiumDocument, MultiMap, PrecomputedScopes } from "langium";
import { CancellationToken } from "vscode-jsonrpc";
import { getPackageName } from "../../utils/ast-util.js";
import {
    isClassDeclaration,
    isDataType,
    isElementRelation,
    isGeneralizationSet,
    isModel,
    isPackageDeclaration,
    Model,
    PackageDeclaration
} from "../generated/ast.js";
import { TontoServices } from "../tonto-module.js";
import { GlobalAstNodeDescription, PackageLocalAstNodeDescription } from "./tonto-ast-node-description.js";
import { TontoQualifiedNameProvider } from "./tonto-name-provider.js";



/**
 * The `TontoScopeComputation` class extends the `DefaultScopeComputation` class and provides
 * additional functionality for computing local scopes and exports in the Tonto language.
 */
export class TontoScopeComputation extends DefaultScopeComputation {
    qualifiedNameProvider: TontoQualifiedNameProvider;

    constructor(services: TontoServices) {
        super(services);
        this.qualifiedNameProvider = services.references.QualifiedNameProvider;
    }

    protected override exportNode(
        node: AstNode,
        exports: AstNodeDescription[],
        document: LangiumDocument<AstNode>): void {
        const packageName = getPackageName(document);
        let description: AstNodeDescription | undefined;
        const localId = this.qualifiedNameProvider.getLocalId(node);

        if (localId) {
            description = this.descriptions.createDescription(node, localId, document);
            if (packageName) {
                exports.push(new PackageLocalAstNodeDescription(packageName, localId, description));
            }
        }

        const globalId = this.qualifiedNameProvider.getGlobalId(node);
        if (globalId && description) {
            description = this.descriptions.createDescription(node, globalId, document);
            if (packageName) {
                exports.push(new GlobalAstNodeDescription(packageName, globalId, description));
            }
        }
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

        /**
         * For each import item, we need to create descriptions for every element
         * However, in order to allow a better UX, Users should be able to import
         * a package recursively, without importing everything every time.
         */
        await this.processImport(model, scopes, document, cancelToken);

        /**
         * Diagrams does not have scope?
         */
        if (!model.module) {
            return scopes;
        }
        await this.processContainer(model.module, scopes, document, cancelToken);

        const otherAstNodeDescriptions: AstNodeDescription[] = [];
        scopes.forEach((scope, key) => {
            if (isPackageDeclaration(key)) {
                if (model.module && key.id !== model.module.id) {
                    otherAstNodeDescriptions.push(scope);
                }
            }
        });

        scopes.addAll(model.module, otherAstNodeDescriptions);

        return scopes;
    }

    private async processImport(
        model: Model,
        scopes: MultiMap<AstNode, AstNodeDescription>,
        document: LangiumDocument<AstNode>,
        cancelToken: CancellationToken
    ): Promise<void> {
        for (const importItem of model.imports) {
            const PackageDeclaration = importItem.referencedModel?.ref;
            if (PackageDeclaration) {
                await this.processContainer(PackageDeclaration, scopes, document, cancelToken);
                // Recursively process the imports of the imported package
                await this.processImport(PackageDeclaration.$container, scopes, document, cancelToken);
            }
        }
    }

    /**
     * Process the container and add the descriptions to the scopes
     */
    private async processContainer(
        container: PackageDeclaration,
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
                if (qualifiedName) {
                    const descriptionQualified = this.descriptions.createDescription(element, qualifiedName, document);
                    localDescriptions.push(descriptionQualified);
                }
            }
            if (isClassDeclaration(element) || isDataType(element) || isGeneralizationSet(element)) {
                if (element.id !== undefined) {
                    const qualifiedName = this.qualifiedNameProvider.getQualifiedName(element);
                    const name = this.qualifiedNameProvider.getName(element);
                    const description = this.descriptions.createDescription(element, name, document);
                    const descriptionQualified = this.descriptions.createDescription(element, qualifiedName, document);
                    localDescriptions.push(description);
                    localDescriptions.push(descriptionQualified);
                    if (isClassDeclaration(element) && element.references.length > 0) {
                        for (const internalElement of element.references) {
                            if (isElementRelation(internalElement)) {
                                const name = this.qualifiedNameProvider.getQualifiedName(internalElement);
                                if (name) {
                                    const internalDescription = this.descriptions.createDescription(internalElement, name, document);
                                    localDescriptions.push(internalDescription);
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

    /**
     * With this method, we aim to export every package defined as Global. That way, it can be used anywhere in any other 
     * package without needing to be imported.
     * @param document The Langium Document to be analyzed
     * @param cancelToken 
     */
    override async computeExports(document: LangiumDocument<AstNode>, cancelToken: CancellationToken = CancellationToken.None): Promise<AstNodeDescription[]> {
        const exports: AstNodeDescription[] = [];
        const rootNode = document.parseResult.value;
        if (isModel(rootNode) && rootNode.module && rootNode.module.isGlobal) {
            for (const node of AstUtils.streamContents(rootNode.module)) {
                await interruptAndCheck(cancelToken);
                this.exportNode(node, exports, document);
            }
        }
        const otherExports = await super.computeExports(document, cancelToken);
        return [...exports, ...otherExports];
    }

    private getPackageDeclarationFromContainer(element: AstNode): PackageDeclaration {
        let PackageDeclaration: AstNode;
        PackageDeclaration = element;
        while (PackageDeclaration.$type !== "PackageDeclaration") {
            if (PackageDeclaration.$container === undefined) {
                break;
            }
            PackageDeclaration = PackageDeclaration.$container;
        }
        return PackageDeclaration as PackageDeclaration;
    }
}
