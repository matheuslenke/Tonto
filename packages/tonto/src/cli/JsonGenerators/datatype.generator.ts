import { Class, Package, Property } from "ontouml-js";
import { ComplexDataType } from "../../language-server/generated/ast";
import { setAttributeCardinality } from "./class.generator";

export function customDataTypeGenerator(
  dataType: ComplexDataType,
  model: Package,
): Class {
  const dataTypeClass = model.createDatatype(dataType.name);

  return dataTypeClass;
}

export function customDataTypeAttributesGenerator(
  dataType: ComplexDataType,
  dataTypes: Class[]
) {
  const dataTypeClass = dataTypes.find(item => item.getName() === dataType.name);
  if (dataTypeClass) {
    dataType.attributes.forEach((element) => {
      let createdAttribute: Property | undefined;

      if (element.attributeTypeRef !== undefined) {
        const customType = dataTypes.find(
          (item) => item.getName() === element.attributeTypeRef.ref?.name
        );

        if (customType) {
          createdAttribute = dataTypeClass.createAttribute(
            customType,
            element.name
          );
        }
      }

      if (createdAttribute) {
        // Set the attribute cardinality
        setAttributeCardinality(element.cardinality, createdAttribute);

        // Set the attribute isOrdered meta-attribute
        createdAttribute.isOrdered = element.isOrdered;

        // Set the attribute isDerived meta-attribute
        createdAttribute.isDerived = element.isDerived;

        // Set the attribute isReadOnly meta-attribute
        createdAttribute.isReadOnly = element.isConst;
      }
    });
  } else {
    // console.log(chalk.yellow(`Could not generate attributes for dataType class named ${dataType.name}`));
  }
}
