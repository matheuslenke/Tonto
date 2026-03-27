import { Class } from "ontouml-js";

export function findGeneratedDataType(dataTypes: Class[], identifier: string | undefined): Class | undefined {
    if (!identifier) {
        return undefined;
    }

    return dataTypes.find((item) => item.id === identifier)
        ?? dataTypes.find((item) => item.getName() === identifier)
        ?? dataTypes.find((item) => item.getNameOrId() === identifier);
}
