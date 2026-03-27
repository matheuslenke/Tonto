import { describe, expect, it } from "vitest";
import { replaceWhitespace, formatForId } from "../../../src/cli/utils/replaceWhitespace.js";

describe("replaceWhitespace", () => {
  it("should replace spaces with underscores", () => {
    expect(replaceWhitespace("hello world")).toBe("hello_world");
  });

  it("should replace multiple spaces", () => {
    expect(replaceWhitespace("a b c")).toBe("a_b_c");
  });

  it("should return unchanged string when no spaces", () => {
    expect(replaceWhitespace("hello")).toBe("hello");
  });

  it("should return empty string for undefined input", () => {
    expect(replaceWhitespace(undefined)).toBe("");
  });

  it("should return empty string for empty string input", () => {
    expect(replaceWhitespace("")).toBe("");
  });
});

describe("formatForId", () => {
  it("should strip leading numbers", () => {
    expect(formatForId("123abc")).toBe("abc");
  });

  it("should append underscore for reserved keywords (withKeywords=true)", () => {
    expect(formatForId("class")).toBe("class_");
    expect(formatForId("kind")).toBe("kind_");
  });

  it("should not append underscore when withKeywords=false", () => {
    expect(formatForId("class", false)).toBe("class");
    expect(formatForId("kind", false)).toBe("kind");
  });

  it("should remove dots and colons", () => {
    expect(formatForId("a.b:c")).toBe("abc");
  });

  it("should remove non-alphanumeric characters except underscore", () => {
    expect(formatForId("hello@world#test")).toBe("helloworldtest");
  });

  it("should replace spaces with underscores", () => {
    expect(formatForId("hello world")).toBe("hello_world");
  });

  it("should return empty string for undefined input", () => {
    expect(formatForId(undefined)).toBe("");
  });

  it("should return empty string for empty string input", () => {
    expect(formatForId("")).toBe("");
  });

  it("should handle combined transformations", () => {
    // removeLeadingNumbers runs first, then space/dot replacement
    expect(formatForId("123 hello.world")).toBe("_helloworld");
  });
});
