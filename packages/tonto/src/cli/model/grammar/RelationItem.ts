import { CompositeGeneratorNode, NL } from "langium/generate";
import { OntoumlElement, OntoumlType, Package, Relation } from "ontouml-js";
import { getNearestParentPackage } from "../../utils/getParentPackage.js";
import { formatForId } from "../../utils/replaceWhitespace.js";
import { ASTDeclarationItem } from "./AstDeclarationItem.js";
import { CardinalityItem } from "./CardinalityItem.js";

enum RelationType {
    association,
    aggregation,
    composition
}

export class RelationItem extends ASTDeclarationItem {
    relation: Relation;
    stereotype: string;
    firstEnd: OntoumlElement;
    firstEndMetaAttributes: string[] = [];
    firstCardinality: CardinalityItem;

    name: string | undefined;
    external: boolean;

    secondCardinality: CardinalityItem;
    secondEnd: OntoumlElement;
    secondEndMetaAttributes: string[];
    relationType?: RelationType = RelationType.association;
    specializations: string[] = [];
    inverseOf: string[] = [];

    constructor(relation: Relation, external: boolean = false) {
        super();
        this.relation = relation;
        this.stereotype = relation.stereotype;
        this.name = formatForId(relation.getName());
        this.secondEndMetaAttributes = [];
        this.external = external;
        this.firstEnd = relation.getSourceClass();
        this.firstCardinality = new CardinalityItem(relation.getSourceEnd().cardinality);

        this.secondCardinality = new CardinalityItem(relation.getTargetEnd().cardinality);
        this.secondEnd = relation.getTarget();
        this.specializations = relation.getGeneralizationsWhereSpecific().map(item => formatForId(item.getName()));

        // TODO: Method uninplemented in ontouml-js
        // this.inverseOf = relation.getAllOppositeRelationEnds().map(item => formatForId(item.getName()));
    }

    public getReferencedPackages(): Package[] {
        const sourcePack = getNearestParentPackage(this.relation.getSourceClass());
        const targetPack = getNearestParentPackage(this.relation.getTargetClass());
        const packages: Package[] = [];
        if (sourcePack) {
            packages.push(sourcePack as Package);
        }
        if (targetPack) {
            packages.push(targetPack as Package);
        }
        return packages;
    }


    /**
     * Write to Node Methods
     * @param node 
     */

    override writeToNode(node: CompositeGeneratorNode): void {
        this.writeStereotype(node);

        if (this.external) {
            node.append("relation ");
            node.append(formatForId(this.firstEnd.getName()), " ");
        }

        this.firstCardinality.writeToNode(node);
        node.append(" ");
        this.writeTypeAndName(node);
        node.append(" ");
        this.secondCardinality.writeToNode(node);
        node.append(" ");

        this.writeTargetElement(node);

        node.append(" ", NL);
    }

    private writeStereotype(node: CompositeGeneratorNode): void {
        if (this.stereotype) {
            node.append(`@${formatForId(this.stereotype, false)} `);
        }
    }

    private writeTypeAndName(node: CompositeGeneratorNode): void {
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

    private writeTargetElement(node: CompositeGeneratorNode) {
        if (this.secondEnd.type === OntoumlType.RELATION_TYPE) {
            node.append(`${this.secondEnd.getName()}`);
        } else {
            node.append(`${formatForId(this.secondEnd.getNameOrId())}`);
        }
    }

    // private writeSpecialization(node: CompositeGeneratorNode) {
    //     if (this.specializes.length > 0) {
    //         node.append("specializes ");
    //         this.specializes.forEach((item, index) => {
    //             if (index < this.specializes.length - 1) {
    //                 node.append(`${item}, `);
    //             } else {
    //                 node.append(item);
    //             }
    //         });
    //     }
    // }

    // private writeInverseOf(node: CompositeGeneratorNode) {
    //     if (this.inverseOf?.length > 0) {
    //         const first = this.inverseOf.at(0);
    //         if (first) {
    //             node.append(" inverseOf ", first, " ");
    //         }
    //     }
    // }

    // private writeSubSets() {

    // }

    // private writeRedefines() {

    // }

    override getNumberOfInternalElements(): number {
        return 1;
    }
}