import { describe, expect, it } from "vitest";
import { ErrorMessages } from "../../../src/language/models/ErrorMessages.js";

describe("ErrorMessages", () => {
  it("should have non-empty strings for all enum values", () => {
    for (const value of Object.values(ErrorMessages)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it("should have no duplicate error messages", () => {
    const values = Object.values(ErrorMessages);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  it("should contain expected error message keys", () => {
    expect(ErrorMessages.cyclicSpecialization).toBeDefined();
    expect(ErrorMessages.ultimateSortalSpecializesUltimateSortal).toBeDefined();
    expect(ErrorMessages.sortalSpecializesUniqueUltimateSortal).toBeDefined();
    expect(ErrorMessages.sortalSpecializeNoUltimateSortal).toBeDefined();
    expect(ErrorMessages.rigidSpecializeAntiRigid).toBeDefined();
    expect(ErrorMessages.genSetSpecialization).toBeDefined();
    expect(ErrorMessages.genSetCircularGeneralization).toBeDefined();
  });
});
