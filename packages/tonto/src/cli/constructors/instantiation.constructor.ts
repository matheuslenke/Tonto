
import { CompositeGeneratorNode } from "langium/generate";
import { Class, RelationStereotype } from "ontouml-js";
import { formatForId } from "../utils/replaceWhitespace.js";

export function createInstantiation(element: Class, fileNode: CompositeGeneratorNode) {
    const ownRelations = element.getOwnIncomingRelations();

    const instantiationRelation = ownRelations.find(
        (relation) => relation.stereotype === RelationStereotype.INSTANTIATION
    );

    if (instantiationRelation) {
        const source = instantiationRelation.getSourceClass();
        fileNode.append(`(instanceOf ${formatForId(source.getName())})`);
    }
}
