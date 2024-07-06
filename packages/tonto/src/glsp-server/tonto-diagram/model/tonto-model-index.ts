import { ClassDeclaration, ElementRelation, NodeView, isClassDeclaration, isElementRelation, isNodeView } from "../../../language/index.js";
import { TontoIndex } from "../../common/tonto-index.js";

export class TontoModelIndex extends TontoIndex {
    findClassDeclaration(id: string): ClassDeclaration | undefined {
        return this.findSemanticElement(id, isClassDeclaration);
    }

    findElementRelation(id: string): ElementRelation | undefined {
        return this.findSemanticElement(id, isElementRelation);
    }

    findEntityNode(id: string): NodeView | undefined {
        return this.findSemanticElement(id, isNodeView);
    }

    // TODO
    // findRelationshipEdge(id: string): RelationshipEdge | undefined {
    //     return this.findSemanticElement(id, isRelationshipEdge);
    // }
}