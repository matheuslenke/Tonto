import { randomInt } from "crypto";
import { CompositeGeneratorNode, NL } from "langium/generate";
import { Property } from "ontouml-js";
import { isReservedKeyword } from "../../language/utils/isReservedKeyword.js";
import { formatForId } from "../utils/replaceWhitespace.js";
import { constructCardinality } from "./cardinality.constructor.js";

export function constructAttributes(attributes: Property[], fileNode: CompositeGeneratorNode) {
  attributes.forEach((attribute) => {
    const propertyType = attribute.propertyType?.getName();

    if (propertyType) {
      let name = attribute.getNameOrId()
      if (isReservedKeyword(attribute.getNameOrId())) {
        name = name + `${randomInt(1000)}`
      }
      fileNode.append(`${formatForId(attribute.getName())} : ${propertyType}`);

      if (attribute.cardinality) {
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
      fileNode.append(`${formatForId(attribute.getName())}`, NL);
    }
  });
}
