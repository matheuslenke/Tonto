export function replaceWhitespace(word: string | undefined): string {
  if (word) {
    return word.replace(/[-+]/g, "").replace(/[ ]/g, "_");
  } else {
    return "";
  }
}
