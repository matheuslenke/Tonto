import { CompositeGeneratorNode, NL } from "langium/generate";
import { Cardinality, MultilingualText, OntoumlElement, OntoumlType } from "ontouml-js";
import { isReservedKeyword } from "../../language/utils/isReservedKeyword.js";
import { getTontoSourceName } from "../utils/tontoMetadata.js";

type NameCarrier = {
    id?: string;
    propertyAssignments?: object | null;
    getName?: () => string | null;
};

const BUILT_IN_TONTO_PACKAGE_NAMES = new Set(["Tonto.BasicDataTypes", "BasicDataTypes"]);
const BUILT_IN_TONTO_TYPE_NAMES = new Set(["string", "number", "boolean", "date", "time", "datetime"]);

export function formatTontoIdentifier(name: string | null | undefined): string {
    if (!name) {
        return "";
    }

    let formattedName = name.trim().replace(/^\d+/, "").trim();
    formattedName = formattedName.replace(/\s+/g, "-");
    formattedName = formattedName.replace(/[^A-Za-z0-9_-]/g, "");
    formattedName = formattedName.replace(/^-+/, "");

    if (!formattedName) {
        return "";
    }

    if (!/^[A-Za-z_]/.test(formattedName)) {
        formattedName = `_${formattedName}`;
    }

    if (isReservedKeyword(formattedName)) {
        formattedName = `${formattedName}_`;
    }

    return formattedName;
}

export function formatTontoQualifiedName(name: string | null | undefined): string {
    if (!name) {
        return "";
    }

    return name
        .split(".")
        .map((segment) => formatTontoIdentifier(segment))
        .filter((segment) => segment.length > 0)
        .join(".");
}

export function getRenderableElementName(element: NameCarrier | undefined): string | undefined {
    if (!element) {
        return undefined;
    }

    const sourceName = getTontoSourceName(element);
    if (sourceName) {
        return sourceName;
    }

    const name = element.getName?.();
    if (name) {
        return name;
    }

    if (!element.id) {
        return undefined;
    }

    return element.id.split(".").at(-1) ?? element.id;
}

export function formatElementReference(
    element: OntoumlElement | NameCarrier | undefined,
    currentPackageName: string | undefined
): string {
    const renderedName = getRenderableElementName(element);
    if (!renderedName) {
        return "";
    }

    if (element instanceof OntoumlElement && isBuiltInTontoType(element, renderedName)) {
        return renderedName;
    }

    const localName = formatTontoIdentifier(renderedName);
    if (!localName) {
        return "";
    }

    if (!(element instanceof OntoumlElement)) {
        return localName;
    }

    const ownerPackageName = getContainingPackageName(element);
    if (ownerPackageName && currentPackageName && ownerPackageName !== currentPackageName) {
        return `${formatTontoQualifiedName(ownerPackageName)}.${localName}`;
    }

    return localName;
}

export function appendLabelAndDescription(
    element: { name?: MultilingualText | null; description?: MultilingualText | null },
    identifier: string,
    fileNode: CompositeGeneratorNode
): void {
    appendMultilingualBlock("label", element.name, fileNode, identifier);
    appendMultilingualBlock("description", element.description, fileNode);
}

export function hasRenderableDocumentation(
    element: { name?: MultilingualText | null; description?: MultilingualText | null },
    identifier: string
): boolean {
    const labelEntries = getMultilingualEntries(element.name);
    const descriptionEntries = getMultilingualEntries(element.description);

    return labelEntries.some(([, value]) => value !== identifier) || labelEntries.length > 1 || descriptionEntries.length > 0;
}

export function isDefaultCardinality(cardinality: Cardinality | undefined): boolean {
    const bounds = cardinality?.getCardinalityBounds();
    return String(bounds?.lowerBound) === "1" && String(bounds?.upperBound) === "1";
}

export function getContainingPackageName(element: OntoumlElement | undefined): string | undefined {
    return getContainingPackage(element)?.getName?.();
}

export function isBuiltInTontoPackage(packageName: string | undefined): boolean {
    return !!packageName && BUILT_IN_TONTO_PACKAGE_NAMES.has(packageName);
}

function appendMultilingualBlock(
    blockName: "label" | "description",
    text: MultilingualText | null | undefined,
    fileNode: CompositeGeneratorNode,
    identifier?: string
): void {
    const entries = getMultilingualEntries(text);
    if (entries.length === 0) {
        return;
    }

    if (blockName === "label" && identifier && entries.length === 1 && entries[0]?.[1] === identifier) {
        return;
    }

    fileNode.append(`${blockName} {`, NL);
    fileNode.indent((ident) => {
        entries.forEach(([language, value]) => {
            ident.append(`@${language} ${JSON.stringify(value)}`, NL);
        });
    });
    fileNode.append("}", NL);
}

function getMultilingualEntries(text: MultilingualText | null | undefined): Array<[string, string]> {
    if (!text || typeof text.entries !== "function") {
        return [];
    }

    return text.entries().filter(
        (entry): entry is [string, string] =>
            Array.isArray(entry)
            && entry.length === 2
            && typeof entry[0] === "string"
            && typeof entry[1] === "string"
            && entry[1].length > 0
    );
}

function getContainingPackage(element: OntoumlElement | undefined): OntoumlElement | undefined {
    let current = element?.container;

    while (current && current.type !== OntoumlType.PACKAGE_TYPE) {
        current = current.container;
    }

    return current;
}

function isBuiltInTontoType(element: OntoumlElement, renderedName: string): boolean {
    return BUILT_IN_TONTO_TYPE_NAMES.has(renderedName) && isBuiltInTontoPackage(getContainingPackageName(element));
}
