import { Class, Property } from "ontouml-js";
import { Attribute, ClassDeclaration, DataType } from "../../language/generated/ast.js";
import {
    JSON_GENERATION_STEPS,
    createJsonGenerationError,
    createJsonGenerationNodeInfo,
} from "../requests/jsonGeneration.js";
import { setTontoSourceName } from "../utils/tontoMetadata.js";
import { setPropertyCardinality } from "./cardinality.generator.js";
import { findGeneratedDataType } from "./utils/findGeneratedDataType.js";

export function attributeGenerator(
    classElement: ClassDeclaration | DataType,
    createdClass: Class,
    dataTypes: Class[],
    resolveDataType?: (dataType: DataType | undefined) => Class | undefined
): void {
    classElement.attributes.forEach((attribute: Attribute) => {
        let createdAttribute: Property | undefined;
        if (attribute.attributeTypeRef) {
            const customType = resolveDataType?.(attribute.attributeTypeRef.ref)
                ?? findGeneratedDataType(dataTypes, attribute.attributeTypeRef.ref?.name);
            if (!customType) {
                const referencedTypeName = attribute.attributeTypeRef.ref?.name ?? attribute.attributeTypeRef.$refText ?? "(unknown datatype)";
                throw createJsonGenerationError(`Could not generate attribute "${attribute.name}".`, {
                    step: JSON_GENERATION_STEPS.attributeGeneration,
                    info: [
                        createJsonGenerationNodeInfo(attribute, {
                            code: "unresolved_attribute_type",
                            title: "Unresolved attribute type",
                            description: `Attribute "${attribute.name}" in ${getAttributeOwnerLabel(classElement)} refers to datatype "${referencedTypeName}", but that datatype was not generated.`,
                        }),
                    ],
                });
            }

            if (customType) {
                createdAttribute = createdClass.createAttribute(customType, attribute.name);
            }
        }
        if (createdAttribute) {
            // Set the attribute cardinality
            setPropertyCardinality(attribute.cardinality, createdAttribute);
            setTontoSourceName(createdAttribute, attribute.name);

            createdAttribute.isOrdered = attribute.isOrdered;
            createdAttribute.isDerived = attribute.isDerived;
            createdAttribute.isReadOnly = attribute.isConst;
        }
    });
}

function getAttributeOwnerLabel(classElement: ClassDeclaration | DataType): string {
    return classElement.$type === "DataType"
        ? `datatype "${classElement.name}"`
        : `class "${classElement.name}"`;
}
