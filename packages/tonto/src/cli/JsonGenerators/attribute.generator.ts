import { Class, Property } from "ontouml-js";
import { Attribute, ClassDeclaration, DataType } from "../../language-server/generated/ast";
import { setPropertyCardinality } from "./cardinality.generator";

export function attributeGenerator(
  classElement: ClassDeclaration | DataType,
  createdClass: Class,
  dataTypes: Class[]
): void {
  classElement.attributes.forEach((attribute: Attribute) => {
    let createdAttribute: Property | undefined;
    if (attribute.attributeTypeRef) {
      const customType = dataTypes.find((item) => item.name.getText() === attribute.attributeTypeRef.ref?.name);
      if (customType) {
        createdAttribute = createdClass.createAttribute(customType, attribute.name);
      }
    }
    if (createdAttribute) {
      // Set the attribute cardinality
      setPropertyCardinality(attribute.cardinality, createdAttribute);

      createdAttribute.isOrdered = attribute.isOrdered;
      createdAttribute.isDerived = attribute.isDerived;
      createdAttribute.isReadOnly = attribute.isConst;
    }
  });
}
