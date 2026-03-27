import { describe, expect, it } from "vitest";
import { OntologicalNature } from "ontouml-js";
import { compareArrays, compareArrayWithSet } from "../../../src/language/utils/compareArrays.js";

describe("compareArrays", () => {
  it("should return true for equal arrays with same order", () => {
    const a = [OntologicalNature.functional_complex, OntologicalNature.collective];
    const b = [OntologicalNature.functional_complex, OntologicalNature.collective];
    expect(compareArrays(a, b)).toBe(true);
  });

  it("should return true for equal arrays with different order", () => {
    const a = [OntologicalNature.collective, OntologicalNature.functional_complex];
    const b = [OntologicalNature.functional_complex, OntologicalNature.collective];
    expect(compareArrays(a, b)).toBe(true);
  });

  it("should return false for arrays with different lengths", () => {
    const a = [OntologicalNature.functional_complex];
    const b = [OntologicalNature.functional_complex, OntologicalNature.collective];
    expect(compareArrays(a, b)).toBe(false);
  });

  it("should return true for both empty arrays", () => {
    expect(compareArrays([], [])).toBe(true);
  });

  it("should return false for one empty and one non-empty", () => {
    expect(compareArrays([], [OntologicalNature.functional_complex])).toBe(false);
  });

  it("should return false for arrays with different elements", () => {
    const a = [OntologicalNature.functional_complex];
    const b = [OntologicalNature.collective];
    expect(compareArrays(a, b)).toBe(false);
  });
});

describe("compareArrayWithSet", () => {
  it("should return true when array matches set", () => {
    const arr = [OntologicalNature.functional_complex, OntologicalNature.collective];
    const set = new Set([OntologicalNature.functional_complex, OntologicalNature.collective]);
    expect(compareArrayWithSet(arr, set)).toBe(true);
  });

  it("should return false when array does not match set", () => {
    const arr = [OntologicalNature.functional_complex];
    const set = new Set([OntologicalNature.collective]);
    expect(compareArrayWithSet(arr, set)).toBe(false);
  });

  it("should return false for different sizes", () => {
    const arr = [OntologicalNature.functional_complex, OntologicalNature.collective];
    const set = new Set([OntologicalNature.functional_complex]);
    expect(compareArrayWithSet(arr, set)).toBe(false);
  });

  it("should return true for both empty", () => {
    expect(compareArrayWithSet([], new Set())).toBe(true);
  });
});
