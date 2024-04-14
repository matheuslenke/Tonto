import { isReservedKeyword } from "../../language/utils/isReservedKeyword.js";

export function replaceWhitespace(word: string | undefined): string {
    if (word) {
        return word.replace(/[ ]/g, "_");
    } else {
        return "";
    }
}

export function formatForId(word: string | undefined, withKeywords: boolean = true): string {
    if (word) {
        word = removeLeadingNumbers(word);
        if (withKeywords && isReservedKeyword(word)) {
            return word.replace(/[ ]/g, "_").replace(":", "").replace(".", "").replace(/[^A-Za-z0-9_]/g, "") + "_";
        }
        return word.replace(/[ ]/g, "_").replace(".", "").replace(":", "").replace(/[^A-Za-z0-9_]/g, "");
    } else {
        return "";
    }
}

function removeLeadingNumbers(str: string): string {
    // Use a regular expression to match one or more digits (\d+) at the beginning (^)
    const regex = /^\d+/;

    // Replace the matching numbers with an empty string
    return str.replace(regex, "");
}