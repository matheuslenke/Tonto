import { Project } from "ontouml-js";

type SerializedOntoumlElement = {
    id?: string;
    type?: string;
    subsettedProperties?: SerializedOntoumlElement[] | null;
    redefinedProperties?: SerializedOntoumlElement[] | null;
    [key: string]: unknown;
};

export function serializeProject(project: Project): string {
    const serializedProject = JSON.parse(JSON.stringify(project)) as SerializedOntoumlElement;
    normalizePropertyReferenceArrays(serializedProject);
    return JSON.stringify(serializedProject, null, 2);
}

function normalizePropertyReferenceArrays(element: unknown): void {
    if (!element || typeof element !== "object") {
        return;
    }

    const serializedElement = element as SerializedOntoumlElement;

    if (Array.isArray(serializedElement.subsettedProperties)) {
        serializedElement.subsettedProperties = serializedElement.subsettedProperties.map(toReference);
    }

    if (Array.isArray(serializedElement.redefinedProperties)) {
        serializedElement.redefinedProperties = serializedElement.redefinedProperties.map(toReference);
    }

    Object.values(serializedElement).forEach((value) => {
        if (Array.isArray(value)) {
            value.forEach((item) => normalizePropertyReferenceArrays(item));
        } else {
            normalizePropertyReferenceArrays(value);
        }
    });
}

function toReference(element: SerializedOntoumlElement): SerializedOntoumlElement {
    return {
        type: element.type,
        id: element.id,
    };
}
