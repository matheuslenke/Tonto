import { describe, expect, it } from "vitest";
import { ClassStereotype } from "ontouml-js";
import {
  hasSortalStereotype,
  hasNonSortalStereotype,
  isRigidStereotype,
  isAntiRigidStereotype,
  isSemiRigidStereotype,
  getClassStereotype,
  allowedStereotypeRestrictedToMatches,
} from "../../../src/language/models/StereotypeUtils.js";
import { OntologicalCategoryEnum } from "../../../src/language/models/OntologicalCategory.js";

describe("StereotypeUtils", () => {
  describe("getClassStereotype", () => {
    const mappings: [string, ClassStereotype][] = [
      ["type", ClassStereotype.TYPE],
      ["historicalRole", ClassStereotype.HISTORICAL_ROLE],
      ["historicalRoleMixin", ClassStereotype.HISTORICAL_ROLE_MIXIN],
      ["event", ClassStereotype.EVENT],
      ["situation", ClassStereotype.SITUATION],
      ["category", ClassStereotype.CATEGORY],
      ["mixin", ClassStereotype.MIXIN],
      ["roleMixin", ClassStereotype.ROLE_MIXIN],
      ["phaseMixin", ClassStereotype.PHASE_MIXIN],
      ["kind", ClassStereotype.KIND],
      ["collective", ClassStereotype.COLLECTIVE],
      ["quantity", ClassStereotype.QUANTITY],
      ["relator", ClassStereotype.RELATOR],
      ["quality", ClassStereotype.QUALITY],
      ["mode", ClassStereotype.MODE],
      ["subkind", ClassStereotype.SUBKIND],
      ["role", ClassStereotype.ROLE],
      ["phase", ClassStereotype.PHASE],
      ["enumeration", ClassStereotype.ENUMERATION],
      ["enum", ClassStereotype.ENUMERATION],
      ["datatype", ClassStereotype.DATATYPE],
      ["abstract", ClassStereotype.ABSTRACT],
    ];

    it.each(mappings)("should map '%s' to ClassStereotype.%s", (input, expected) => {
      expect(getClassStereotype(input)).toBe(expected);
    });

    it("should return undefined for unknown stereotype", () => {
      expect(getClassStereotype("unknown")).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      expect(getClassStereotype("")).toBeUndefined();
    });
  });

  describe("hasSortalStereotype", () => {
    const sortals = ["kind", "collective", "quantity", "relator", "quality", "mode", "subkind", "phase", "role", "historicalRole"];
    const nonSortals = ["category", "mixin", "roleMixin", "phaseMixin", "historicalRoleMixin"];

    it.each(sortals)("should return true for sortal '%s'", (stereotype) => {
      expect(hasSortalStereotype(stereotype)).toBe(true);
    });

    it.each(nonSortals)("should return false for non-sortal '%s'", (stereotype) => {
      expect(hasSortalStereotype(stereotype)).toBe(false);
    });

    it("should return false for unknown", () => {
      expect(hasSortalStereotype("unknown")).toBe(false);
    });
  });

  describe("hasNonSortalStereotype", () => {
    const nonSortals = ["category", "mixin", "roleMixin", "phaseMixin", "historicalRoleMixin"];
    const sortals = ["kind", "subkind", "role", "phase"];

    it.each(nonSortals)("should return true for non-sortal '%s'", (stereotype) => {
      expect(hasNonSortalStereotype(stereotype)).toBe(true);
    });

    it.each(sortals)("should return false for sortal '%s'", (stereotype) => {
      expect(hasNonSortalStereotype(stereotype)).toBe(false);
    });

    it("should return false for unknown", () => {
      expect(hasNonSortalStereotype("unknown")).toBe(false);
    });
  });

  describe("isRigidStereotype", () => {
    const rigid = ["kind", "collective", "quantity", "subkind", "category", "quality", "mode", "relator"];
    const antiRigid = ["role", "roleMixin", "phase", "phaseMixin", "historicalRole", "historicalRoleMixin"];

    it.each(rigid)("should return true for rigid '%s'", (stereotype) => {
      expect(isRigidStereotype(stereotype)).toBe(true);
    });

    it.each(antiRigid)("should return false for anti-rigid '%s'", (stereotype) => {
      expect(isRigidStereotype(stereotype)).toBe(false);
    });

    it("should return false for unknown", () => {
      expect(isRigidStereotype("unknown")).toBe(false);
    });
  });

  describe("isAntiRigidStereotype", () => {
    const antiRigid = ["role", "roleMixin", "phase", "phaseMixin", "historicalRole", "historicalRoleMixin"];
    const rigid = ["kind", "collective", "quantity", "subkind", "category"];

    it.each(antiRigid)("should return true for anti-rigid '%s'", (stereotype) => {
      expect(isAntiRigidStereotype(stereotype)).toBe(true);
    });

    it.each(rigid)("should return false for rigid '%s'", (stereotype) => {
      expect(isAntiRigidStereotype(stereotype)).toBe(false);
    });

    it("should return false for unknown", () => {
      expect(isAntiRigidStereotype("unknown")).toBe(false);
    });
  });

  describe("isSemiRigidStereotype", () => {
    it("should return true for mixin", () => {
      expect(isSemiRigidStereotype("mixin")).toBe(true);
    });

    it("should return false for kind", () => {
      expect(isSemiRigidStereotype("kind")).toBe(false);
    });

    it("should return false for role", () => {
      expect(isSemiRigidStereotype("role")).toBe(false);
    });

    it("should return false for unknown", () => {
      expect(isSemiRigidStereotype("unknown")).toBe(false);
    });
  });

  describe("allowedStereotypeRestrictedToMatches", () => {
    it("should have entries for all OntologicalCategoryEnum values", () => {
      for (const key of Object.values(OntologicalCategoryEnum)) {
        expect(allowedStereotypeRestrictedToMatches).toHaveProperty(key);
      }
    });

    it("should have non-empty arrays for all entries except CLASS", () => {
      for (const [key, value] of Object.entries(allowedStereotypeRestrictedToMatches)) {
        if (key === OntologicalCategoryEnum.CLASS) {
          expect(value).toHaveLength(0);
        } else {
          expect(value.length).toBeGreaterThan(0);
        }
      }
    });
  });
});
