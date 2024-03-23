import { CompositeGeneratorNode } from "langium/generate";
import { Class } from "ontouml-js";
import { formatForId } from "../../utils/replaceWhitespace.js";
import { ASTDeclarationItem } from "./AstDeclarationItem.js";

export class EnumItem extends ASTDeclarationItem {
    name: string;
    nameSlug: string;
    elements: string[] = [];

    constructor(ontoumlDatatype: Class) {
        super();

        this.name = ontoumlDatatype.getNameOrId();
        this.nameSlug = formatForId(this.name);
        this.elements = ontoumlDatatype.getAllLiterals().map(item => item.getNameOrId());
    }

    override writeToNode(node: CompositeGeneratorNode): void {
        node.append(`enum ${this.nameSlug}`);
        if (this.elements.length > 0) {
            node.append("{").appendNewLine().indent(indent => {
                this.elements.forEach((item, index) => {
                    if (index < this.elements.length - 1) {
                        indent.append(formatForId(item), ", ");
                    } else {
                        indent.append(formatForId(item));
                    }
                });
            });
            node.appendNewLine().append("}");
        }
    }

    override getNumberOfInternalElements(): number {
        return 1;
    }
}