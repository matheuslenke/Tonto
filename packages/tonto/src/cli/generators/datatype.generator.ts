import { Class, Package, Property } from "ontouml-js";
import { DataType } from "../../language/generated/ast.js";
import { setPropertyCardinality } from "./cardinality.generator.js";

import { getDescription, getMultilingualText } from "./utils/labelUtils.js";
import { findGeneratedDataType } from "./utils/findGeneratedDataType.js";

export function customDataTypeGenerator(dataType: DataType, model: Package): Class {
    const name = getMultilingualText(dataType.label, dataType.name);
    const description = getDescription(dataType.description);

    const dataTypeClass = model.createDatatype(name.getText());
    if (description) {
        dataTypeClass.description = description;
    }
    dataTypeClass.name = name;
    dataTypeClass.id = dataType.name;

    return dataTypeClass;
}

export function customDataTypeAttributesGenerator(dataType: DataType, dataTypes: Class[]) {
    const dataTypeClass = findGeneratedDataType(dataTypes, dataType.name);
    if (dataTypeClass) {
        dataType.attributes.forEach((element) => {
            let createdAttribute: Property | undefined;

            if (element.attributeTypeRef !== undefined) {
                const customType = findGeneratedDataType(dataTypes, element.attributeTypeRef.ref?.name);

                if (customType) {
                    createdAttribute = dataTypeClass.createAttribute(customType, element.name);
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
    // console.log(chalk.yellow(`Could not generate attributes for dataType class named ${dataType.name}`));
    }
}
