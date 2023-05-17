import { CompositeGeneratorNode, NL } from "langium";
import { Property } from "ontouml-js";
import { formatForId } from "../utils/replaceWhitespace";

export function constructAttributes(
  attributes: Property[],
  fileNode: CompositeGeneratorNode
) {
  attributes.forEach((attribute) => {
    const propertyType = attribute.propertyType.getName();

    if (propertyType) {
      fileNode.append(`${formatForId(attribute.getName())} : ${propertyType}`);

      if (attribute.isReadOnly || attribute.isOrdered || attribute.isDerived) {
        fileNode.append(" { ");
        attribute.isReadOnly && fileNode.append("const ");
        attribute.isOrdered && fileNode.append("ordered ");
        attribute.isDerived && fileNode.append("derived");
        fileNode.append(" } ");
      }

      fileNode.append(NL);
    }
  });
}
