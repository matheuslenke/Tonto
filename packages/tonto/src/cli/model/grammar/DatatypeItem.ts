import { CompositeGeneratorNode, NL } from "langium/generate";
import { Class, Package } from "ontouml-js";
import { formatForId } from "../../utils/replaceWhitespace.js";
import { ASTDeclarationItem } from "./AstDeclarationItem.js";
import { ClassDeclarationItem } from "./ClassDeclarationItem.js";

export type ClassDeclarationOrDatatypeItem = DataTypeItem | ClassDeclarationItem

export class DataTypeItem extends ASTDeclarationItem {
    datatype: Class;
    rootPackageName: string;
    name: string;
    nameSlug: string;
    ontologicalNature?: string;
    specializations: ClassDeclarationOrDatatypeItem[] = [];
    attributes: string[];

    constructor(ontoumlDatatype: Class) {
        super();
        this.datatype = ontoumlDatatype;
        this.rootPackageName = formatForId(ontoumlDatatype.getModelOrRootPackage().getName());
        this.name = ontoumlDatatype.getNameOrId();
        this.nameSlug = formatForId(this.name);
        this.attributes = ontoumlDatatype.getOwnAttributes().map(item => formatForId(item.getNameOrId()));
    }

    public getReferencedPackages(): Package[] {
        const packages = this.datatype.getGeneralizationsWhereSpecific()
            .flatMap(item => item.getModelOrRootPackage())
            .filter(item => formatForId(item.getName()) !== this.datatype.getModelOrRootPackage()?.getName());
        const attributesPackages = this.datatype.getOwnAttributes()
            .flatMap(item => item.getModelOrRootPackage())
            .filter(item => formatForId(item.getName()) !== this.datatype.getModelOrRootPackage()?.getName());

        return [...packages, ...attributesPackages];
    }

    override writeToNode(node: CompositeGeneratorNode): void {
        node.append(`datatype ${this.nameSlug}`);
        if (this.attributes.length > 0) {
            node.append("{", NL);
            this.attributes.forEach((item, index) => {
                if (index < this.attributes.length - 1) {
                    node.append(item, ",");
                } else {
                    node.append(item);
                }
            });
            node.append(NL);
            node.append("}", NL);
        }
    }

    override getNumberOfInternalElements(): number {
        return 1;
    }
}