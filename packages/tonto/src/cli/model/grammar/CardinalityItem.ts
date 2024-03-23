import { CompositeGeneratorNode } from "langium/generate";
import { Cardinality } from "ontouml-js";
import { ASTDeclarationItem } from "./AstDeclarationItem.js";

export class CardinalityItem extends ASTDeclarationItem {
    lowerBound: string | undefined;
    upperBound: string | undefined;

    constructor(cardinality: Cardinality) {
        super();
        this.lowerBound = cardinality.lowerBound;
        this.upperBound = cardinality.upperBound;
    }

    override writeToNode(node: CompositeGeneratorNode): void {
        if (!this.lowerBound && !this.upperBound) {
            return;
        }

        if (this.lowerBound === this.upperBound) {
            node.append("[").append(this.lowerBound).append("]");
        } else {
            node.append("[").append(this.lowerBound).append("..").append(this.upperBound).append("]");
        }
    }

    override getNumberOfInternalElements(): number {
        return 0;
    }
}