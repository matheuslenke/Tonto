export function replaceWhitespace(word: string | undefined): string {
  if (word) {
    return word.replace(/[ ]/g, "_");
  } else {
    return "";
  }
}

export function formatForId(word: string | undefined): string {
  if (word) {
    return word.replace(/[ ]/g, "_").replace(/[^A-Za-z0-9_]/g, "");
  } else {
    return "";
  }
}
