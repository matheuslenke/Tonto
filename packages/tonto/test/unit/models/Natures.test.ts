import { describe, expect, it } from "vitest";
import { OntologicalNature } from "ontouml-js";
import { tontoNatureUtils } from "../../../src/language/models/Natures.js";

describe("Natures", () => {
  describe("getNatureFromAst", () => {
    const singleMappings: [string, OntologicalNature][] = [
      ["collectives", OntologicalNature.collective],
      ["extrinsic-modes", OntologicalNature.extrinsic_mode],
      ["intrinsic-modes", OntologicalNature.intrinsic_mode],
      ["functional-complexes", OntologicalNature.functional_complex],
      ["qualities", OntologicalNature.quality],
      ["quantities", OntologicalNature.quantity],
      ["relators", OntologicalNature.relator],
      ["types", OntologicalNature.type],
      ["abstract-individuals", OntologicalNature.abstract],
      ["events", OntologicalNature.event],
      ["situations", OntologicalNature.situation],
    ];

    it.each(singleMappings)("should map AST nature '%s' to OntologicalNature", (astNature, expected) => {
      const result = tontoNatureUtils.getNatureFromAst(astNature as any);
      expect(result).toContain(expected);
    });

    it("should map 'objects' to functional_complex, collective, and quantity", () => {
      const result = tontoNatureUtils.getNatureFromAst("objects" as any);
      expect(result).toHaveLength(3);
      expect(result).toContain(OntologicalNature.functional_complex);
      expect(result).toContain(OntologicalNature.collective);
      expect(result).toContain(OntologicalNature.quantity);
    });

    it("should return empty array for unknown nature", () => {
      const result = tontoNatureUtils.getNatureFromAst("unknown" as any);
      expect(result).toEqual([]);
    });
  });

  describe("getAstNatureFromOntoumljs", () => {
    const mappings: [OntologicalNature, string][] = [
      [OntologicalNature.functional_complex, "functional-complexes"],
      [OntologicalNature.collective, "collectives"],
      [OntologicalNature.quantity, "quantities"],
      [OntologicalNature.relator, "relators"],
      [OntologicalNature.intrinsic_mode, "intrinsic-modes"],
      [OntologicalNature.extrinsic_mode, "extrinsic-modes"],
      [OntologicalNature.quality, "qualities"],
      [OntologicalNature.event, "events"],
      [OntologicalNature.situation, "situations"],
      [OntologicalNature.type, "types"],
      [OntologicalNature.abstract, "abstract-individuals"],
    ];

    it.each(mappings)("should map OntologicalNature.%s to '%s'", (nature, expected) => {
      expect(tontoNatureUtils.getAstNatureFromOntoumljs(nature)).toBe(expected);
    });
  });

  describe("round-trip consistency", () => {
    const singleNatures: [string, OntologicalNature][] = [
      ["collectives", OntologicalNature.collective],
      ["extrinsic-modes", OntologicalNature.extrinsic_mode],
      ["intrinsic-modes", OntologicalNature.intrinsic_mode],
      ["functional-complexes", OntologicalNature.functional_complex],
      ["qualities", OntologicalNature.quality],
      ["quantities", OntologicalNature.quantity],
      ["relators", OntologicalNature.relator],
      ["types", OntologicalNature.type],
      ["abstract-individuals", OntologicalNature.abstract],
      ["events", OntologicalNature.event],
      ["situations", OntologicalNature.situation],
    ];

    it.each(singleNatures)(
      "AST '%s' -> OntologicalNature -> AST should round-trip",
      (astNature, ontNature) => {
        const fromAst = tontoNatureUtils.getNatureFromAst(astNature as any);
        expect(fromAst).toContain(ontNature);
        const backToAst = tontoNatureUtils.getAstNatureFromOntoumljs(fromAst[0]);
        expect(backToAst).toBe(astNature);
      }
    );
  });
});
