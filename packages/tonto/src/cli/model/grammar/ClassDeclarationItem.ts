import chalk from "chalk";
import { CompositeGeneratorNode } from "langium/generate";
import { Class, ClassStereotype, Package, Property } from "ontouml-js";
import { getStereotypeWord } from "../../constructors/classElement.constructor.js";
import { formatForId } from "../../utils/replaceWhitespace.js";
import { ASTDeclarationItem } from "./AstDeclarationItem.js";
import { AttributeItem } from "./AttributeItem.js";
import { RelationItem } from "./RelationItem.js";

export class ClassDeclarationItem extends ASTDeclarationItem {
    ontoumlClass: Class;
    rootPackageName: string;
    name: string;
    nameSlug: string;
    ontologicalCategory: string;
    ontologicalNatures: string[] = [];

    specializations: string[];

    attributes: AttributeItem[] = [];
    relations: RelationItem[] = [];

    constructor(ontoumlClass: Class, rootPackageName: string) {
        super();
        this.ontoumlClass = ontoumlClass;
        this.rootPackageName = rootPackageName;
        this.name = ontoumlClass.getNameOrId();
        this.nameSlug = formatForId(this.name);
        this.ontologicalCategory = getStereotypeWord(ontoumlClass.stereotype);
        const attributes: Property[] = ontoumlClass.getOwnAttributes();
        this.specializations = ontoumlClass.getGeneralizationsWhereSpecific()
            .map(item => formatForId(item.getGeneralClass().getNameOrId()));

        /**
         * Create Elements
         */
        attributes.forEach(property => {
            try {
                const attr = new AttributeItem(property);
                this.attributes.push(attr);
            } catch (error) {
                console.log(chalk.red("Error creating property", error));
            }
        });
        ontoumlClass.getAllOutgoingRelations()
            .forEach(relation => {
                try {
                    this.relations.push(new RelationItem(relation));
                } catch (error) {
                    console.log(chalk.red("Error creating relation", error));
                }
            });
    }

    public getReferencedPackages(): Package[] {
        const thisPackages = this.ontoumlClass.getGeneralizationsWhereSpecific()
            .flatMap(item => item.getGeneralClass().getModelOrRootPackage())
            .filter(item => formatForId(item.getNameOrId()) !== this.rootPackageName);
        const relationPackages = this.ontoumlClass.getAllOutgoingRelations()
            .flatMap(item => item.getTarget().getModelOrRootPackage())
            .filter(item => formatForId(item.getName()) !== this.rootPackageName);
        const relationSpecializationPackages = this.ontoumlClass.getAllOutgoingRelations()
            .flatMap(item => item.getGeneralizationsWhereSpecific())
            .map(item => item.getModelOrRootPackage())
            .filter(item => formatForId(item.getName()) !== this.rootPackageName);
        const attributesPackages = this.ontoumlClass.getOwnAttributes()
            .map(item => item.getModelOrRootPackage())
            .filter(item => formatForId(item.getName()) !== formatForId(this.rootPackageName));

        return [...thisPackages, ...relationPackages, ...relationSpecializationPackages, ...attributesPackages];
    }

    override writeToNode(node: CompositeGeneratorNode): void {
        node.append(`${this.ontologicalCategory} ${this.nameSlug}`);

        this.writeOntologicalNatures(node);

        if (this.specializations.length > 0) {
            node.append(" specializes ");
            this.specializations.forEach((item, index) => {
                if (index < this.specializations.length - 1) {
                    node.append(item, ", ");
                } else {
                    node.append(item, " ");
                }
            });
        }


        if (this.attributes.length > 0 || this.relations.length > 0) {
            node.append("{").appendNewLine();
            node.indent(indent => {
                this.attributes.forEach(attribute => attribute.writeToNode(indent));

                this.relations.forEach(relation => relation.writeToNode(indent));
            });

            node.append("}");
        }
    }

    writeOntologicalNatures(node: CompositeGeneratorNode): void {
        const natures: string[] = [];
        if (this.ontoumlClass.isRestrictedToFunctionalComplex()
            && this.ontoumlClass.isRestrictedToCollective()
            && this.ontoumlClass.isRestrictedToQuantity()) {
            natures.push("relators");
        }
        if (this.ontoumlClass.isRestrictedToAbstract()) {
            natures.push("abstract-individuals");
        }
        if (this.ontoumlClass.isRestrictedToCollective()
            && this.ontoumlClass.stereotype !== ClassStereotype.COLLECTIVE) {
            natures.push("collectives");
        }
        if (this.ontoumlClass.isRestrictedToEvent()
            && this.ontoumlClass.stereotype !== ClassStereotype.EVENT) {
            natures.push("events");
        }
        if (this.ontoumlClass.isRestrictedToFunctionalComplex()
            && this.ontoumlClass.stereotype !== ClassStereotype.KIND) {
            natures.push("functional-complexes");
        }
        if (this.ontoumlClass.isRestrictedToQuantity()
            && this.ontoumlClass.stereotype !== ClassStereotype.QUANTITY) {
            natures.push("quantities");
        }
        if (this.ontoumlClass.isRestrictedToRelator()
            && this.ontoumlClass.stereotype !== ClassStereotype.RELATOR) {
            natures.push("relators");
        }
        if (this.ontoumlClass.isRestrictedToIntrinsicMode()
            && this.ontoumlClass.stereotype !== ClassStereotype.MODE) {
            natures.push("intrinsic-modes");
        }
        if (this.ontoumlClass.isRestrictedToExtrinsicMode()
            && this.ontoumlClass.stereotype !== ClassStereotype.MODE) {
            natures.push("extrinsic-modes");
        }
        if (this.ontoumlClass.isRestrictedToQuality()
            && this.ontoumlClass.stereotype !== ClassStereotype.QUALITY) {
            natures.push("qualities");
        }
        if (this.ontoumlClass.isRestrictedToSituation()
            && this.ontoumlClass.stereotype !== ClassStereotype.SITUATION) {
            natures.push("situations");
        }
        if (this.ontoumlClass.isRestrictedToType()
            && this.ontoumlClass.stereotype !== ClassStereotype.TYPE) {
            natures.push("types");
        }

        if (natures.length > 0) {
            node.append(" of ");
            natures.forEach((nature, index) => {
                if (index < natures.length - 1) {
                    node.append(nature, ",");
                } else {
                    node.append(nature, " ");
                }
            });
        }
    }

    override getNumberOfInternalElements(): number {
        const relationsCount = this.relations.reduce((previous, item) => previous + item.getNumberOfInternalElements(), 0);
        return 1 + this.attributes.length + relationsCount;
    }
}