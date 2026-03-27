import { describe, expect, it } from "vitest";
import { isReservedKeyword } from "../../../src/language/utils/isReservedKeyword.js";

describe("isReservedKeyword", () => {
  describe("TypeScript keywords", () => {
    const tsKeywords = [
      "break", "case", "catch", "class", "const", "continue", "default", "delete",
      "do", "else", "enum", "export", "extends", "false", "finally", "for", "function",
      "if", "import", "in", "instanceof", "new", "null", "return", "super", "switch",
      "this", "throw", "true", "try", "typeof", "var", "void", "while", "with",
      "let", "package", "private", "protected", "public", "static", "yield",
    ];

    it.each(tsKeywords)("should return true for TypeScript keyword '%s'", (kw) => {
      expect(isReservedKeyword(kw)).toBe(true);
    });
  });

  describe("Relation stereotypes", () => {
    const relationStereotypes = [
      "comparative", "mediation", "characterization", "externalDependence",
      "componentOf", "memberOf", "subCollectionOf", "subQuantityOf",
      "instantiation", "termination", "participational", "participation",
      "historicalDependence", "creation", "manifestation", "bringsAbout",
      "triggers", "composition", "aggregation", "inherence", "formal", "constitution",
    ];

    it.each(relationStereotypes)("should return true for relation stereotype '%s'", (rs) => {
      expect(isReservedKeyword(rs)).toBe(true);
    });
  });

  describe("Class stereotypes", () => {
    const classStereotypes = [
      "kind", "collective", "quantity", "quality", "mode", "intrinsicMode",
      "extrinsicMode", "relator", "type", "subkind", "phase", "role",
      "historicalRole", "category", "mixin", "phaseMixin", "roleMixin",
      "historicalRoleMixin", "event", "situation", "process",
    ];

    it.each(classStereotypes)("should return true for class stereotype '%s'", (cs) => {
      expect(isReservedKeyword(cs)).toBe(true);
    });
  });

  describe("Non-reserved words", () => {
    const nonReserved = ["Person", "foo", "myClass", "University", "Student"];

    it.each(nonReserved)("should return false for non-reserved word '%s'", (word) => {
      expect(isReservedKeyword(word)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isReservedKeyword("")).toBe(false);
    });
  });

  describe("Case sensitivity", () => {
    it("should be case-sensitive (Kind is not reserved, kind is)", () => {
      expect(isReservedKeyword("kind")).toBe(true);
      expect(isReservedKeyword("Kind")).toBe(false);
    });
  });
});
