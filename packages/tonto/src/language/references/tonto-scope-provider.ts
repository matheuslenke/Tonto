import { AstNode, AstNodeDescription, DefaultScopeProvider, ReferenceInfo, Scope, ScopeOptions, StreamScope, URI, stream } from "langium";
import { CrossReference, CrossReferenceContainer, ReferenceableElement, isGlobalElementReference, isSyntheticDocument } from "../../model-server/types.js";
import { findRootNode, getDocument, getPackageName } from "../../utils/ast-util.js";
import { Model, isModel } from "../generated/ast.js";
import { TontoServices } from "../tonto-module.js";
import { GlobalAstNodeDescription, PackageAstNodeDescription } from "./tonto-ast-node-description.js";
import { CrossReferenceContext } from "./types.js";

export interface CompletionScope {
    source: ReferenceInfo;
    elementScope: Scope;
}

export class TontoScopeProvider extends DefaultScopeProvider {
    constructor(
        protected services: TontoServices,
        protected idProvider = services.references.QualifiedNameProvider
    ) {
        super(services);
    }

    override getScope(context: ReferenceInfo): Scope {
        return super.getScope(context);
    }

    protected override createScope(elements: Iterable<AstNodeDescription>, outerScope?: Scope | undefined, options?: ScopeOptions | undefined): Scope {
        const scopes = new StreamScope(stream(elements), outerScope, { ...options, caseInsensitive: false });
        // outerScope?.getAllElements().forEach(console.log);
        /**
         * Get scope from Imported Items
         */
        return scopes;
    }

    /**
     * This method created the global scope for each document.
     * @param referenceType 
     * @param _context 
     * @returns 
     */
    protected override getGlobalScope(referenceType: string, _context: ReferenceInfo): Scope {
        const globalScope = super.getGlobalScope(referenceType, _context);

        // globalScope.getAllElements().forEach(description => { console.log(description.name); });

        // get the package that this request is coming
        const source = getDocument(_context.container);
        const sourcePackage = getPackageName(source);

        const dependencyScope = new StreamScope(
            globalScope.getAllElements().filter(description => description instanceof GlobalAstNodeDescription)
        );

        const packageScope = new StreamScope(
            globalScope.getAllElements().filter(description => sourcePackage === this.getPackageId(description)),
            dependencyScope,
        );
        return packageScope;
    }

    /**
    * Returns the package identifier for the given description.
    *
    * @param description node description
    * @returns package identifier
    */
    protected getPackageId(description: AstNodeDescription): string {
        return description instanceof PackageAstNodeDescription
            ? description.packageId
            : "unknown";
    }

    protected resolveCrossReferenceContainer(container: CrossReferenceContainer): AstNode | undefined {
        if (isSyntheticDocument(container)) {
            this.services.shared.workspace.LangiumDocuments.getOrCreateDocument(URI.parse(container.uri)).then((document) => {
                return { $type: container.type, $container: document.parseResult.value };
            });
        }
        if (isModel(container)) {
            return this.services.shared.workspace.IndexManager
                .resolveSemanticElement(URI.parse(container.module?.id ?? "unknown"));
        }
        if (isGlobalElementReference(container)) {
            return this.services.shared.workspace.IndexManager.resolveElementById(container.globalId, container.type);
        }
        return undefined;
    }

    referenceContextToInfo(ctx: CrossReferenceContext): ReferenceInfo {
        let container = this.resolveCrossReferenceContainer(ctx.container);
        if (!container) {
            throw Error("Invalid CrossReference Container");
        }
        for (const segment of ctx.syntheticElements ?? []) {
            container = {
                $container: container,
                $containerProperty: segment.property,
                $type: segment.type
            };
        }
        const referenceInfo: ReferenceInfo = {
            reference: { $refText: "" },
            container: container,
            property: ctx.property
        };
        return referenceInfo;
    }

    resolveCrossReference(reference: CrossReference): AstNode | undefined {
        const description = this.getScope(this.referenceContextToInfo(reference))
            .getAllElements()
            .find(desc => desc.name === reference.value);
        return this.services.shared.workspace.IndexManager.resolveElement(description);
    }

    getCompletionScope(ctx: CrossReferenceContext): CompletionScope {
        const referenceInfo = this.referenceContextToInfo(ctx);
        const model = findRootNode(referenceInfo.container) as Model;
        const packageId = model.module?.id ?? "unknown";
        const filteredDescriptions = this.getScope(referenceInfo)
            .getAllElements()
            .filter(description => this.filterCompletion(description, packageId, referenceInfo.container, referenceInfo.property))
            .distinct(description => description.name);
        const elementScope = this.createScope(filteredDescriptions);
        return { elementScope, source: referenceInfo };
    }

    complete(ctx: CrossReferenceContext): ReferenceableElement[] {
        return this.getCompletionScope(ctx)
            .elementScope.getAllElements()
            .map<ReferenceableElement>(description => ({
                uri: description.documentUri.toString(),
                type: description.type,
                label: description.name
            }))
            .toArray();
    }

    filterCompletion(description: AstNodeDescription, packageId: string, container?: AstNode, property?: string): boolean {
        // if (isRelationshipAttribute(container)) {
        //     // only show relevant attributes depending on the parent or child context
        //     if (property === "child") {
        //         return description.name.startsWith(container.$container.child?.$refText + ".");
        //     }
        //     if (property === "parent") {
        //         return description.name.startsWith(container.$container.parent?.$refText + ".");
        //     }
        // }
        // if (isSourceObject(container) && property === "entity" && container.$container.target.entity.ref) {
        //     const targetEntity = container.$container.target.entity.ref;
        //     if (description instanceof GlobalAstNodeDescription) {
        //         return description.name !== this.idProvider.getGlobalId(targetEntity);
        //     }
        //     return description.name !== this.idProvider.getLocalId(targetEntity);
        // }
        // if (isGlobalDescriptionForLocalPackage(description, packageId)) {
        //     // we want to keep fully qualified names in the scope so we can do proper linking
        //     // but want to hide it from the user for local options, i.e., if we are in the same project we can skip the project name
        //     return false;
        // }
        return true;
    }
}
