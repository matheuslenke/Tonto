import { CompositeGeneratorNode, NL } from "langium/generate";
import { GeneralizationSet, Package } from "ontouml-js";
import { getNearestParentPackage } from "../../utils/getParentPackage.js";
import { formatForId } from "../../utils/replaceWhitespace.js";
import { ASTDeclarationItem } from "./AstDeclarationItem.js";

export class GenSetItem extends ASTDeclarationItem {
    genset: GeneralizationSet;
    rootPackageName: string;

    name: string;
    nameSlug: string;
    generalItem?: string;
    categorizer?: string;
    specificItems?: string[] = [];

    constructor(genset: GeneralizationSet) {
        super();
        this.genset = genset;
        this.rootPackageName = formatForId(genset?.getModelOrRootPackage().getName());
        this.name = genset.getNameOrId();
        this.nameSlug = formatForId(this.name);

        this.generalItem = genset.generalizations?.map(item => formatForId(item.general.getName())).at(0);
        this.categorizer = formatForId(genset.categorizer?.getName());
        this.specificItems = genset.generalizations?.map(item => formatForId(item.specific.getName()));
    }

    getReferencedPackages(): Package[] {
        const generals = this.genset.generalizations;
        let packages: Package[] = [];
        if (generals) {
            const generalReferences = generals
                .map(element => getNearestParentPackage(element.container))
                .filter(item => item && formatForId(item.getNameOrId()) !== this.rootPackageName)
                .flatMap(item => item as Package ?? []);
            packages = packages.concat(generalReferences);
        }

        // const categorizerReference = this.genset.categorizer?.getModelOrRootPackage();
        const specifics = this.genset.getSpecifics();
        if (specifics) {
            const specificsPackage = specifics
                .map(element => getNearestParentPackage(element.container))
                .filter(item => item && formatForId(item.getNameOrId()) !== this.rootPackageName)
                .flatMap(item => item as Package ?? []);
            packages = packages.concat(specificsPackage);
        }

        return packages.filter(item => item !== undefined);
    }

    override writeToNode(node: CompositeGeneratorNode): void {
        if (!this.generalItem && this.specificItems?.length === 0) {
            return;
        }
        node.append(`genset ${this.nameSlug} {`).appendNewLine();
        node.indent(indent => {
            indent.append(`general ${this.generalItem}`, NL);

            if (this.categorizer) {
                indent.append("categorizer").append(this.categorizer);
            }

            indent.append("specifics ");
            this.specificItems?.forEach((item, index) => {
                if (this.specificItems && index < this.specificItems?.length - 1) {
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