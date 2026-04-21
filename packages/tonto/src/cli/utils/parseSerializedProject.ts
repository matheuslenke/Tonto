import { MultilingualText, Project, serializationUtils } from "ontouml-js";

export function parseSerializedProject(serializedProject: string): Project {
    return JSON.parse(serializedProject, reviveSerializedProject) as Project;
}

function reviveSerializedProject(key: string, value: unknown): unknown {
    const revivedValue = reviveMultilingualTextField(key, value);
    return serializationUtils.revive(key, revivedValue);
}

function reviveMultilingualTextField(key: string, value: unknown): unknown {
    if ((key !== "name" && key !== "description") || !isPlainObject(value)) {
        return value;
    }

    const entries = Object.entries(value).filter(
        (entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string"
    );
    if (entries.length === 0) {
        return value;
    }

    const multilingualText = new MultilingualText();
    entries.forEach(([language, text]) => multilingualText.addText(text, language));
    return multilingualText;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof MultilingualText);
}
