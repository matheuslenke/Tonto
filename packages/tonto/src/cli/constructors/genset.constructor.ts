import { CompositeGeneratorNode, NL } from "langium/generate";
import { GeneralizationSet } from "ontouml-js";
import { formatForId } from "../utils/replaceWhitespace.js";

export function constructGenSet(element: GeneralizationSet, fileNode: CompositeGeneratorNode) {
    fileNode.appendIf(element.isDisjoint, "disjoint ");
    fileNode.appendIf(element.isComplete, "complete ");
    fileNode.append("genset ");
    fileNode.append(element.getNameOrId());

    fileNode.append("{", NL);
    fileNode.indent(ident => {
        ident.append("general ", formatForId(element.getGeneralClass().getNameOrId()), NL);
        // ident.appendIf(element.categorizer !== undefined, `categorizer ${element.categorizer.getNameOrId()}`)
        //   .appendNewLineIfNotEmpty();
        const specifics = element.getSpecifics();
        ident.appendIf(specifics.length > 0, "specifics ");

        specifics.forEach((value, index) => {
            const name = formatForId(value.getNameOrId());
            if (index === specifics.length - 1) {
                ident.append(name + " ");
            } else {
                ident.append(name + ", ");
            }
        });
        ident.append(NL);
    });
    fileNode.append("}", NL);
}