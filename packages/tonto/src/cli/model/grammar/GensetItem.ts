import { CompositeGeneratorNode } from "langium/generate";
import { GeneralizationSet, Package } from "ontouml-js";
import { formatForId } from "../../utils/replaceWhitespace.js";
import { ASTDeclarationItem } from "./AstDeclarationItem.js";

export class GenSetItem extends ASTDeclarationItem {
    genset: GeneralizationSet;
    rootPackageName: string;

    name: string;
    nameSlug: string;
    generalItems: string[] = [];
    categorizer?: string;
    specificItems: string[] = [];

    constructor(genset: GeneralizationSet) {
        super();
        this.genset = genset;
        this.rootPackageName = formatForId(genset.getModelOrRootPackage().getName());
        this.name = genset.getNameOrId();
        this.nameSlug = formatForId(this.name);

        this.generalItems = genset.generalizations.map(item => formatForId(item.general.getName()));
        this.categorizer = formatForId(genset.categorizer?.getName());
        this.specificItems = genset.generalizations.map(item => formatForId(item.specific.getName()));
    }

    getReferencedPackages(): Package[] {
        const generalReferences = this.genset.generalizations
            .map(element => element.getModelOrRootPackage())
            .filter(item => formatForId(item.getNameOrId()) !== this.genset.getModelOrRootPackage().getName());

        const categorizerReference = this.genset.categorizer.getModelOrRootPackage();

        const specificsPackage = this.genset.getSpecifics()
            .map(element => element.getModelOrRootPackage())
            .filter(item => formatForId(item.getNameOrId()) !== this.genset.getModelOrRootPackage().getName());

        return [...generalReferences, ...specificsPackage, categorizerReference];
    }

    override writeToNode(node: CompositeGeneratorNode): void {
        node.append(`genset ${this.nameSlug} {`).appendNewLine();
        node.indent(indent => {
            indent.append("general ");
            this.generalItems.forEach((item, index) => {
                if (index < this.generalItems.length - 1) {
                    indent.append(item, ", ");
                } else {
                    indent.append(item).appendNewLine();
                }
            });

            if (this.categorizer) {
                indent.append("categorizer").append(this.categorizer);
            }

            this.specificItems.forEach((item, index) => {
                if (index < this.generalItems.length - 1) {
                    indent.append(item, ", ");
                } else {
                    indent.append(item).appendNewLine();
                }
            });
        });
        node.append("}").appendNewLine();
    }

    override getNumberOfInternalElements(): number {
        return 1;
    }
}