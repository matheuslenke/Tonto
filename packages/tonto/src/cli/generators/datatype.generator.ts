import { Class, Package } from "ontouml-js";
import { DataType } from "../../language/generated/ast.js";
import {
    JSON_GENERATION_STEPS,
    createJsonGenerationError,
    createJsonGenerationNodeInfo,
} from "../requests/jsonGeneration.js";
import { setTontoSourceName } from "../utils/tontoMetadata.js";

import { attributeGenerator } from "./attribute.generator.js";
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
    setTontoSourceName(dataTypeClass, dataType.name);

    return dataTypeClass;
}

export function customDataTypeAttributesGenerator(
    dataType: DataType,
    dataTypes: Class[],
    resolveDataType?: (dataType: DataType | undefined) => Class | undefined
) {
    const dataTypeClass = resolveDataType?.(dataType) ?? findGeneratedDataType(dataTypes, dataType.name);
    if (!dataTypeClass) {
        throw createJsonGenerationError(`Could not generate datatype "${dataType.name}".`, {
            step: JSON_GENERATION_STEPS.attributeGeneration,
            info: [
                createJsonGenerationNodeInfo(dataType, {
                    code: "missing_generated_datatype",
                    title: "Datatype was not generated",
                    description: `Datatype "${dataType.name}" could not be found in the generated OntoUML model before its attributes were processed.`,
                }),
            ],
        });
    }

    attributeGenerator(dataType, dataTypeClass, dataTypes, resolveDataType);
}
