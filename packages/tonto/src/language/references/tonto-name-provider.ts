
import { AstNode, AstUtils, DefaultNameProvider, NameProvider, isAstNode } from "langium";
import {
    isAttribute,
    isClassDeclaration,
    isDataType,
    isElementRelation,
    isEnumElement,
    isGeneralizationSet,
    isPackageDeclaration
} from "../generated/ast.js";
import { TontoServices } from "../tonto-module.js";

export const ID_PROPERTY = "id";

export type IdentifiableAstNode = AstNode & {
    id?: string;
};

export type IdentifiedAstNode = AstNode & {
    [ID_PROPERTY]: string;
};

export function hasId(node?: AstNode): node is IdentifiedAstNode {
    return !!node && ID_PROPERTY in node && typeof node[ID_PROPERTY] === "string";
}

export function getId(node?: AstNode): string | undefined {
    return hasId(node) ? node[ID_PROPERTY] : undefined;
}

export interface IdProvider extends NameProvider {
    getNodeId(node?: AstNode): string | undefined;
    getLocalId(node?: AstNode): string | undefined;
    getGlobalId(node?: AstNode): string | undefined;

    findNextId(type: string, proposal: string | undefined): string;
    findNextId(type: string, proposal: string | undefined, container: AstNode): string;
}

export const QUALIFIED_ID_SEPARATOR = ".";

export function combineIds(...ids: string[]): string {
    return ids.join(QUALIFIED_ID_SEPARATOR);
}

export class TontoQualifiedNameProvider extends DefaultNameProvider implements IdProvider {
    constructor(
        protected services: TontoServices
    ) {
        super();
    }

    /**
    * @param qualifier if the qualifier is a `string`, simple string concatenation is done: `qualifier.name`.
    *      if the qualifier is a `Package` fully qualified name is created: `package1.package2.name`.
    * @param name simple name
    * @returns qualified name separated by `.`
    */
    getQualifiedName(node: AstNode): string | undefined {
        if (isElementRelation(node)) {
            if (!node.id) {
                return undefined;
            }
            const parent = node.$container;
            if (isClassDeclaration(parent)) {
                return `${parent.id}.${node.id}`;
            } else if (isPackageDeclaration(parent)) {
                return `${node.firstEnd?.$refText}.${node.id}`;
            }
            return node.id;
        }
        if (isPackageDeclaration(node)) {
            return node.id;
        }
        if (isClassDeclaration(node)) {
            const parent = node.$container;
            return `${parent.id}.${node.id}`;
        }
        if (
            isAttribute(node) ||
            isGeneralizationSet(node) ||
            isDataType(node) ||
            isEnumElement(node)
        ) {
            const parent = node.$container;
            return `${parent.id}.${node.id}`;
        }
        return undefined;
    }


    override getName(node: AstNode): string | undefined {
        if (isPackageDeclaration(node) ||
            isClassDeclaration(node) ||
            isElementRelation(node) ||
            isAttribute(node) ||
            isGeneralizationSet(node) ||
            isDataType(node) ||
            isEnumElement(node)
        ) {
            return node.id;
        }
        return undefined;
    }

    /**
     * Id Provider methods
     */

    getNodeId(node?: AstNode | undefined): string | undefined {
        return getId(node);
    }

    getLocalId(node?: AstNode | undefined): string | undefined {
        if (!node) {
            return undefined;
        }
        const id = this.getNodeId(node);
        if (!id) {
            return undefined;
        }

        return id;
    }

    getGlobalId(node?: AstNode | undefined): string | undefined {
        let localId = this.getLocalId(node);
        if (!localId) {
            return undefined;
        }
        if (!node) {
            return undefined;
        }
        let parent = this.getParent(node);
        while (parent) {
            if (!isPackageDeclaration(parent)) {
                const parentId = this.getNodeId(parent);
                if (parentId) {
                    localId = combineIds(parentId, localId);
                }
                parent = this.getParent(parent);
            } else {
                break;
            }
        }
        return localId;
    }

    findNextId(type: string, proposal: string | undefined): string;
    findNextId(type: string, proposal: string | undefined, container: AstNode): string;
    findNextId(type: string, proposal: string | undefined, container?: AstNode): string {
        if (isAstNode(container)) {
            return this.findNextIdInContainer(type, proposal?.replaceAll(".", "_") ?? "Element", container);
        }
        return this.findNextIdInIndex(type, proposal?.replaceAll(".", "_") ?? "Element");
    }

    protected getParent(node: AstNode): AstNode | undefined {
        return node.$container;
    }

    protected findNextIdInContainer(type: string, proposal: string, container: AstNode): string {
        const knownIds = AstUtils.streamAst(container)
            .filter(node => node.$type === type)
            .map(this.getNodeId)
            .nonNullable()
            .toArray();
        return this.countToNextId(knownIds, proposal);
    }

    protected findNextIdInIndex(type: string, proposal: string): string {
        const knownIds = this.services.shared.workspace.IndexManager.allElements(type)
            .map(element => element.name)
            .toArray();
        return this.countToNextId(knownIds, proposal);
    }

    protected countToNextId(knownIds: string[], proposal: string): string {
        let nextId = proposal;
        let counter = 1;
        while (knownIds.includes(nextId)) {
            nextId = proposal + counter++;
        }
        return nextId;
    }
}
