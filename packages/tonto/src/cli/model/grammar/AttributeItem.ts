import { CompositeGeneratorNode } from "langium/generate";
import { Property } from "ontouml-js";
import { formatForId } from "../../utils/replaceWhitespace.js";
import { ASTDeclarationItem } from "./AstDeclarationItem.js";
import { CardinalityItem } from "./CardinalityItem.js";

export class AttributeItem extends ASTDeclarationItem {
    name: string;
    nameSlug: string;
    type?: string;
    isConst: boolean;
    isOrdered: boolean;
    isDerived: boolean;
    cardinality: CardinalityItem;

    constructor(property: Property) {
        super();
        this.name = property.getNameOrId();
        this.nameSlug = formatForId(this.name);
        if (property.propertyType) {
            this.type = formatForId(property.propertyType.getNameOrId());
        }
        this.isConst = property.isReadOnly;
        this.isOrdered = property.isOrdered;
        this.isDerived = property.isDerived;
        this.cardinality = new CardinalityItem(property.cardinality);
    }

    override writeToNode(node: CompositeGeneratorNode): void {
        node.append(`${this.nameSlug}: ${this.type ?? "undefined"} `);
        this.cardinality.writeToNode(node);
        node.append(" ");

        if (this.isConst || this.isOrdered || this.isDerived) {
            node.append("{ ");
            node.appendIf(this.isConst, "const ");
            node.appendIf(this.isDerived, "derived ");
            node.appendIf(this.isOrdered, "ordered ");
            node.append("}");
        }
        node.appendNewLine();
    }
    override getNumberOfInternalElements(): number {
        return 1;
    }
}