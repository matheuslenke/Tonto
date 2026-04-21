import { CompositeGeneratorNode, NL } from "langium/generate";
import { Class, Property } from "ontouml-js";
import { isReservedKeyword } from "../../language/utils/isReservedKeyword.js";
import { constructCardinality } from "./cardinality.constructor.js";
import {
    formatElementReference,
    formatTontoIdentifier,
    getContainingPackageName,
    getRenderableElementName,
    isDefaultCardinality,
} from "./renderUtils.js";

export function constructAttributes(attributes: Property[], fileNode: CompositeGeneratorNode, owner: Class) {
    const currentPackageName = getContainingPackageName(owner);
    attributes.forEach((attribute) => {
        let name = getRenderableElementName(attribute) ?? attribute.getNameOrId();
        if (isReservedKeyword(attribute.getNameOrId())) {
            name = name + "_";
        }

        const propertyType = attribute.propertyType
            ? formatElementReference(attribute.propertyType, currentPackageName)
            : undefined;

        if (propertyType) {

            fileNode.append(`${formatTontoIdentifier(name)} : ${propertyType}`);

            if (attribute.cardinality && !isDefaultCardinality(attribute.cardinality)) {
                constructCardinality(attribute.cardinality, fileNode);
            }

            if (attribute.isReadOnly || attribute.isOrdered || attribute.isDerived) {
                fileNode.append(" { ");
                attribute.isReadOnly && fileNode.append("const ");
                attribute.isOrdered && fileNode.append("ordered ");
                attribute.isDerived && fileNode.append("derived");
                fileNode.append(" } ");
            }

            fileNode.append(NL);
        } else {
            fileNode.append(`${formatTontoIdentifier(name)} : undefined`, NL);
        }
    });
}
