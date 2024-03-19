export function formPhrase(words: string[]): string {
  if (words.length === 0) return "";
  if (words.length === 1) return words[0];
  return words.slice(0, -1).join(", ") + " ," + words[words.length - 1];
}
