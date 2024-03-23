import { CompositeGeneratorNode, NL } from "langium/generate";
import { OntoumlElement, OntoumlType, Relation } from "ontouml-js";
import { formatForId } from "../../utils/replaceWhitespace.js";
import { ASTDeclarationItem } from "./AstDeclarationItem.js";
import { CardinalityItem } from "./CardinalityItem.js";

enum RelationType {
    association,
    aggregation,
    composition
}

export class RelationItem extends ASTDeclarationItem {
    stereotype: string;
    firstEndMetaAttributes: string[] = [];
    firstCardinality: CardinalityItem;

    name: string | undefined;

    secondCardinality: CardinalityItem;
    secondEnd: OntoumlElement;
    secondEndMetaAttributes: string[];
    relationType?: RelationType = RelationType.association;
    specializes: string[] = [];
    inverseOf: string[] = [];

    constructor(relation: Relation) {
        super();
        this.stereotype = relation.stereotype;
        this.name = formatForId(relation.getName());
        this.secondEndMetaAttributes = [];

        this.firstCardinality = new CardinalityItem(relation.getSourceEnd().cardinality);

        this.secondCardinality = new CardinalityItem(relation.getTargetEnd().cardinality);
        this.secondEnd = relation.getTarget();
        this.specializes = relation.getGeneralizationsWhereSpecific().map(item => formatForId(item.getName()));

        // TODO: Method uninplemented in ontouml-js
        // this.inverseOf = relation.getAllOppositeRelationEnds().map(item => formatForId(item.getName()));
    }

    override writeToNode(node: CompositeGeneratorNode): void {
        this.writeStereotype(node);

        this.firstCardinality.writeToNode(node);
        node.append(" ");
        this.writeTypeAndName(node);
        node.append(" ");
        this.secondCardinality.writeToNode(node);
        node.append(" ");

        this.writeTargetElement(node);

        node.append(" ", NL);
    }

    writeStereotype(node: CompositeGeneratorNode): void {
        if (this.stereotype) {
            node.append(`@${this.stereotype} `, NL);
        }
    }

    writeTypeAndName(node: CompositeGeneratorNode): void {
        switch (this.relationType) {
            case RelationType.association:
                node.append("--");
                break;
            case RelationType.aggregation:
                node.append("<>--");
                break;
            case RelationType.composition:
                node.append("<o>--");
                break;
        }

        if (this.name) {
            node.append(` ${this.name} --`);
        }
    }

    writeTargetElement(node: CompositeGeneratorNode) {
        if (this.secondEnd.type === OntoumlType.RELATION_TYPE) {
            node.append(`${this.secondEnd.getName()}`);
        } else {
            node.append(`${formatForId(this.secondEnd.getNameOrId())}`);
        }
    }

    writeSpecialization(node: CompositeGeneratorNode) {
        if (this.specializes.length > 0) {
            node.append("specializes ");
            this.specializes.forEach((item, index) => {
                if (index < this.specializes.length - 1) {
                    node.append(`${item}, `);
                } else {
                    node.append(item);
                }
            });
        }
    }

    writeInverseOf(node: CompositeGeneratorNode) {
        if (this.inverseOf?.length > 0) {
            const first = this.inverseOf.at(0);
            if (first) {
                node.append(" inverseOf ", first, " ");
            }
        }
    }

    writeSubSets() {

    }

    writeRedefines() {

    }
    override getNumberOfInternalElements(): number {
        return 1;
    }
}