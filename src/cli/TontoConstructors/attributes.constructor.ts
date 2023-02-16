import { CompositeGeneratorNode, NL } from "langium";
import { Class, Package, Property } from "ontouml-js";
import { replaceWhitespace } from "../utils/replaceWhitespace";

export function constructAttributes(
  packageItem: Package,
  element: Class,
  attributes: Property[],
  fileNode: CompositeGeneratorNode
) {
  attributes.forEach((attribute) => {
    const propertyType = attribute.propertyType;
    if (propertyType) {
      const attributeType = packageItem
        .getAllClasses()
        .find((classItem) => classItem.getName() === propertyType.getName());
      fileNode.append(
        `${replaceWhitespace(
          attribute.getName()
        )} : ${attributeType?.getName()}`
      );

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
