import { describe, expect, it } from "vitest";
import { checkNatureCompatibleWithStereotype } from "../../../src/language/utils/checkNatureCompatibleWithStereotype.js";

describe("checkNatureCompatibleWithStereotype", () => {
  describe("always-compatible natures", () => {
    it("should return true for 'functional-complexes' with any stereotype", () => {
      expect(checkNatureCompatibleWithStereotype("functional-complexes", "kind")).toBe(true);
      expect(checkNatureCompatibleWithStereotype("functional-complexes", "relator")).toBe(true);
      expect(checkNatureCompatibleWithStereotype("functional-complexes", "category")).toBe(true);
      expect(checkNatureCompatibleWithStereotype("functional-complexes", undefined)).toBe(true);
    });

    it("should return true for 'objects' with any stereotype", () => {
      expect(checkNatureCompatibleWithStereotype("objects", "kind")).toBe(true);
      expect(checkNatureCompatibleWithStereotype("objects", "relator")).toBe(true);
      expect(checkNatureCompatibleWithStereotype("objects", undefined)).toBe(true);
    });
  });

  describe("nature-specific compatibility", () => {
    it("'relators' should only be compatible with 'relator'", () => {
      expect(checkNatureCompatibleWithStereotype("relators", "relator")).toBe(true);
      expect(checkNatureCompatibleWithStereotype("relators", "kind")).toBe(false);
      expect(checkNatureCompatibleWithStereotype("relators", "collective")).toBe(false);
    });

    it("'collectives' should only be compatible with 'collective'", () => {
      expect(checkNatureCompatibleWithStereotype("collectives", "collective")).toBe(true);
      expect(checkNatureCompatibleWithStereotype("collectives", "kind")).toBe(false);
      expect(checkNatureCompatibleWithStereotype("collectives", "relator")).toBe(false);
    });

    it("'quantities' should only be compatible with 'quantity'", () => {
      expect(checkNatureCompatibleWithStereotype("quantities", "quantity")).toBe(true);
      expect(checkNatureCompatibleWithStereotype("quantities", "kind")).toBe(false);
    });

    it("'qualities' should only be compatible with 'quality'", () => {
      expect(checkNatureCompatibleWithStereotype("qualities", "quality")).toBe(true);
      expect(checkNatureCompatibleWithStereotype("qualities", "kind")).toBe(false);
    });

    it("'extrinsic-modes' should only be compatible with 'extrinsicMode'", () => {
      expect(checkNatureCompatibleWithStereotype("extrinsic-modes", "extrinsicMode")).toBe(true);
      expect(checkNatureCompatibleWithStereotype("extrinsic-modes", "intrinsicMode")).toBe(false);
      expect(checkNatureCompatibleWithStereotype("extrinsic-modes", "kind")).toBe(false);
    });

    it("'intrinsic-modes' should only be compatible with 'intrinsicMode'", () => {
      expect(checkNatureCompatibleWithStereotype("intrinsic-modes", "intrinsicMode")).toBe(true);
      expect(checkNatureCompatibleWithStereotype("intrinsic-modes", "extrinsicMode")).toBe(false);
      expect(checkNatureCompatibleWithStereotype("intrinsic-modes", "kind")).toBe(false);
    });

    it("'types' should only be compatible with 'type'", () => {
      expect(checkNatureCompatibleWithStereotype("types", "type")).toBe(true);
      expect(checkNatureCompatibleWithStereotype("types", "kind")).toBe(false);
    });
  });

  describe("unknown/default natures", () => {
    it("should return false for unknown nature", () => {
      expect(checkNatureCompatibleWithStereotype("unknown" as any, "kind")).toBe(false);
    });

    it("should return false for 'events' (not handled in switch)", () => {
      expect(checkNatureCompatibleWithStereotype("events", "event")).toBe(false);
    });

    it("should return false for 'situations' (not handled in switch)", () => {
      expect(checkNatureCompatibleWithStereotype("situations", "situation")).toBe(false);
    });
  });
});
