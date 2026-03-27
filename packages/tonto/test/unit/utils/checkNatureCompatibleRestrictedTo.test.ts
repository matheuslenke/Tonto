import { describe, expect, it } from "vitest";
import { checkNatureCompatibleRestrictedTo } from "../../../src/language/utils/checkNatureCompatibleRestrictedTo.js";

describe("checkNatureCompatibleRestrictedTo", () => {
  it("should return true when generalNature is 'objects' regardless of specificNature", () => {
    const specificNatures = [
      "functional-complexes", "collectives", "quantities", "relators",
      "modes", "qualities", "events", "situations", "types", "abstract-individuals",
    ] as const;

    for (const specific of specificNatures) {
      expect(checkNatureCompatibleRestrictedTo("objects" as any, specific as any)).toBe(true);
    }
  });

  it("should return true when both natures are the same", () => {
    const natures = [
      "functional-complexes", "collectives", "quantities", "relators",
      "qualities", "events", "situations", "types", "abstract-individuals",
    ] as const;

    for (const nature of natures) {
      expect(checkNatureCompatibleRestrictedTo(nature as any, nature as any)).toBe(true);
    }
  });

  it("should return false when natures differ and general is not 'objects'", () => {
    expect(
      checkNatureCompatibleRestrictedTo("functional-complexes" as any, "collectives" as any)
    ).toBe(false);
    expect(
      checkNatureCompatibleRestrictedTo("relators" as any, "qualities" as any)
    ).toBe(false);
    expect(
      checkNatureCompatibleRestrictedTo("events" as any, "situations" as any)
    ).toBe(false);
  });
});
