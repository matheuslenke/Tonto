import { Class, Package, Property } from "ontouml-js";
import { DataType } from "../../language/generated/ast.js";
import { setPropertyCardinality } from "./cardinality.generator.js";

export function customDataTypeGenerator(dataType: DataType, model: Package): Class {
    const dataTypeClass = model.createDatatype(dataType.id);

    return dataTypeClass;
}

export function customDataTypeAttributesGenerator(dataType: DataType, dataTypes: Class[]) {
    const dataTypeClass = dataTypes.find((item) => item.getName() === dataType.id);
    if (dataTypeClass) {
        dataType.attributes.forEach((element) => {
            let createdAttribute: Property | undefined;

            if (element.attributeTypeRef !== undefined) {
                const customType = dataTypes.find((item) => item.getName() === element.attributeTypeRef.ref?.id);

                if (customType) {
                    createdAttribute = dataTypeClass.createAttribute(customType, element.id);
                }
            }

            if (createdAttribute) {
                // Set the attribute cardinality
                setPropertyCardinality(element.cardinality, createdAttribute);

                // Set the attribute isOrdered meta-attribute
                createdAttribute.isOrdered = element.isOrdered;

                // Set the attribute isDerived meta-attribute
                createdAttribute.isDerived = element.isDerived;

                // Set the attribute isReadOnly meta-attribute
                createdAttribute.isReadOnly = element.isConst;
            }
        });
    } else {
        // console.log(chalk.yellow(`Could not generate attributes for dataType class named ${dataType.id}`));
    }
}
