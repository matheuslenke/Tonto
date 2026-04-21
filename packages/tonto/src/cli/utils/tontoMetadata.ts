import { ModelElement } from "ontouml-js";

export const TONTO_SOURCE_NAME_PROPERTY = "__tontoName";
export const TONTO_SOURCE_IMPORTS_PROPERTY = "__tontoImports";

type PropertyAssignmentCarrier = {
    propertyAssignments?: object | null;
};

export function setTontoSourceName(element: ModelElement, name: string): void {
    const propertyAssignments = ensurePropertyAssignments(element);
    propertyAssignments[TONTO_SOURCE_NAME_PROPERTY] = name;
}

export function getTontoSourceName(element: PropertyAssignmentCarrier | undefined): string | undefined {
    const propertyAssignments = asRecord(element?.propertyAssignments);
    const sourceName = propertyAssignments?.[TONTO_SOURCE_NAME_PROPERTY];
    return typeof sourceName === "string" ? sourceName : undefined;
}

export function setTontoSourceImports(element: ModelElement, imports: string[]): void {
    const propertyAssignments = ensurePropertyAssignments(element);
    propertyAssignments[TONTO_SOURCE_IMPORTS_PROPERTY] = imports;
}

export function getTontoSourceImports(element: PropertyAssignmentCarrier | undefined): string[] {
    const propertyAssignments = asRecord(element?.propertyAssignments);
    const imports = propertyAssignments?.[TONTO_SOURCE_IMPORTS_PROPERTY];

    if (!Array.isArray(imports)) {
        return [];
    }

    return imports.filter((item): item is string => typeof item === "string");
}

function ensurePropertyAssignments(element: PropertyAssignmentCarrier): Record<string, unknown> {
    const existing = asRecord(element.propertyAssignments);
    if (existing) {
        return existing;
    }

    const propertyAssignments: Record<string, unknown> = {};
    element.propertyAssignments = propertyAssignments;
    return propertyAssignments;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return undefined;
    }

    return value as Record<string, unknown>;
}
