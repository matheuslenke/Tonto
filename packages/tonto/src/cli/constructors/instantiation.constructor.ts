
import { CompositeGeneratorNode } from "langium/generate";
import { Class, RelationStereotype } from "ontouml-js";
import { formatElementReference, getContainingPackageName } from "./renderUtils.js";

export function createInstantiation(element: Class, fileNode: CompositeGeneratorNode) {
    const ownRelations = element.getOwnIncomingRelations();

    const instantiationRelation = ownRelations.find(
        (relation) => relation.stereotype === RelationStereotype.INSTANTIATION
    );

    if (instantiationRelation) {
        const source = instantiationRelation.getSourceClass();
        fileNode.append(` (instanceOf ${formatElementReference(source, getContainingPackageName(element))})`);
    }
}
