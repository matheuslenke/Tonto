import { describe, expect, it } from "vitest";
import { ClassStereotype } from "ontouml-js";
import { getStereotypeWord } from "../../src/cli/constructors/classElement.constructor.js";

describe("getStereotypeWord (constructor)", () => {
  const mappings: [ClassStereotype, string][] = [
    [ClassStereotype.TYPE, "type"],
    [ClassStereotype.HISTORICAL_ROLE, "historicalRole"],
    [ClassStereotype.HISTORICAL_ROLE_MIXIN, "historicalRoleMixin"],
    [ClassStereotype.EVENT, "event"],
    [ClassStereotype.SITUATION, "situation"],
    [ClassStereotype.CATEGORY, "category"],
    [ClassStereotype.MIXIN, "mixin"],
    [ClassStereotype.ROLE_MIXIN, "roleMixin"],
    [ClassStereotype.PHASE_MIXIN, "phaseMixin"],
    [ClassStereotype.KIND, "kind"],
    [ClassStereotype.COLLECTIVE, "collective"],
    [ClassStereotype.QUANTITY, "quantity"],
    [ClassStereotype.RELATOR, "relator"],
    [ClassStereotype.QUALITY, "quality"],
    [ClassStereotype.MODE, "mode"],
    [ClassStereotype.SUBKIND, "subkind"],
    [ClassStereotype.ROLE, "role"],
    [ClassStereotype.PHASE, "phase"],
    [ClassStereotype.ENUMERATION, "enum"],
    [ClassStereotype.DATATYPE, "datatype"],
    [ClassStereotype.ABSTRACT, "class"],
  ];

  it.each(mappings)(
    "should map ClassStereotype.%s to '%s'",
    (stereotype, expected) => {
      expect(getStereotypeWord(stereotype)).toBe(expected);
    }
  );

  it("should return 'class' for unknown stereotype", () => {
    expect(getStereotypeWord("UNKNOWN" as ClassStereotype)).toBe("class");
  });

  describe("round-trip consistency with getClassStereotype", () => {
    // Verify that getStereotypeWord is the inverse of getClassStereotype
    // for the common stereotypes (excluding 'class' which maps to ABSTRACT)
    const roundTripMappings: [ClassStereotype, string][] = [
      [ClassStereotype.TYPE, "type"],
      [ClassStereotype.KIND, "kind"],
      [ClassStereotype.COLLECTIVE, "collective"],
      [ClassStereotype.QUANTITY, "quantity"],
      [ClassStereotype.RELATOR, "relator"],
      [ClassStereotype.QUALITY, "quality"],
      [ClassStereotype.MODE, "mode"],
      [ClassStereotype.SUBKIND, "subkind"],
      [ClassStereotype.ROLE, "role"],
      [ClassStereotype.PHASE, "phase"],
      [ClassStereotype.CATEGORY, "category"],
      [ClassStereotype.MIXIN, "mixin"],
      [ClassStereotype.ROLE_MIXIN, "roleMixin"],
      [ClassStereotype.PHASE_MIXIN, "phaseMixin"],
      [ClassStereotype.EVENT, "event"],
      [ClassStereotype.SITUATION, "situation"],
      [ClassStereotype.HISTORICAL_ROLE, "historicalRole"],
      [ClassStereotype.HISTORICAL_ROLE_MIXIN, "historicalRoleMixin"],
    ];

    it.each(roundTripMappings)(
      "getStereotypeWord(%s) should produce a valid Tonto keyword '%s'",
      (stereotype, expectedKeyword) => {
        const result = getStereotypeWord(stereotype);
        expect(result).toBe(expectedKeyword);
      }
    );
  });
});
