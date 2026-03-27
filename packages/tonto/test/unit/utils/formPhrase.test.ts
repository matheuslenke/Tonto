import { describe, expect, it } from "vitest";
import { formPhrase } from "../../../src/language/utils/formPhrase.js";

describe("formPhrase", () => {
  it("should return empty string for empty array", () => {
    expect(formPhrase([])).toBe("");
  });

  it("should return the single element for array of length 1", () => {
    expect(formPhrase(["hello"])).toBe("hello");
  });

  it("should join two elements with comma separator", () => {
    const result = formPhrase(["hello", "world"]);
    expect(result).toBe("hello ,world");
  });

  it("should join three elements with commas", () => {
    const result = formPhrase(["a", "b", "c"]);
    expect(result).toBe("a, b ,c");
  });

  it("should join four elements with commas", () => {
    const result = formPhrase(["a", "b", "c", "d"]);
    expect(result).toBe("a, b, c ,d");
  });

  it("should preserve special characters in words", () => {
    const result = formPhrase(["functional-complexes", "collectives"]);
    expect(result).toBe("functional-complexes ,collectives");
  });
});
