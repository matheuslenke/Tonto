import { isReservedKeyword } from "../../language/utils/isReservedKeyword.js";

export function replaceWhitespace(word: string | undefined): string {
    if (word) {
        return word.replace(/[ ]/g, "_");
    } else {
        return "";
    }
}

export function formatForId(word: string | undefined): string {
    if (word) {
        if (isReservedKeyword(word)) {
            return word.replace(/[ ]/g, "_").replace(".", "").replace(/[^A-Za-z0-9_]/g, "") + "_";
        }
        return word.replace(/[ ]/g, "_").replace(".", "").replace(/[^A-Za-z0-9_]/g, "");
    } else {
        return "";
    }
}
