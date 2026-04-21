import { MultilingualText, Project } from "ontouml-js";

type SerializedOntoumlElement = {
    id?: string;
    type?: string;
    subsettedProperties?: SerializedOntoumlElement[] | null;
    redefinedProperties?: SerializedOntoumlElement[] | null;
    [key: string]: unknown;
};

const PROPERTY_REFERENCE_KEYS = new Set(["subsettedProperties", "redefinedProperties"]);

export function serializeProject(project: Project): string {
    const originalToJSON = MultilingualText.prototype.toJSON;
    MultilingualText.prototype.toJSON = function(this: MultilingualText): unknown {
        return serializeMultilingualText(this);
    };

    try {
        return JSON.stringify(project, (key, value) => {
            if (PROPERTY_REFERENCE_KEYS.has(key) && Array.isArray(value)) {
                return value.map((element) => toReference(element as SerializedOntoumlElement));
            }

            return value;
        }, 2);
    } finally {
        MultilingualText.prototype.toJSON = originalToJSON;
    }
}

function toReference(element: SerializedOntoumlElement): SerializedOntoumlElement {
    return {
        type: element.type,
        id: element.id,
    };
}

function serializeMultilingualText(text: MultilingualText): string | Record<string, string> | null {
    const entries = text
        .entries()
        .filter((entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string");

    if (entries.length === 0) {
        return null;
    }

    if (entries.length === 1) {
        const [language, value] = entries[0];
        return language === "en" ? value : { [language]: value };
    }

    return Object.fromEntries(entries);
}
