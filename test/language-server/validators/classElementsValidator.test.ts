import { EmptyFileSystem, Grammar } from "langium";
import { ParserRule } from "langium/lib/grammar/generated/ast";
import { Model } from "../../../src/language-server/generated/ast";
import { createTontoServices } from "../../../src/language-server/tonto-module";
import { parseHelper, validationHelper } from "../../../src/test/tonto-test";

describe("ClassElement Validator tests", () => {
  const tontoStub = `
    module UFOS {
      kind Person
      kind Person
    }
  `;
  const services = createTontoServices(EmptyFileSystem);
  const parse = parseHelper<Grammar>(services.Tonto);
  const validate = validationHelper(services.Tonto);

  let rules: ParserRule[] = [];

  it("should have duplicated class names error", async () => {
    const validationResult = await validate(tontoStub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();

    if (diagnostics != undefined) {
      const duplicatedNameError = diagnostics[0];
      expect(duplicatedNameError.message).toBe("Duplicated class declaration");
    }
  });

  const tontoCompatibleNaturesStub = `
    module OntologicalNaturesError {
        category Furniture of objects
        category SpecificFurniture of collectives specializes Furniture
        category EventFurniture of collectives, objects
        category ErrorFurniture of collectives, objects specializes EventFurniture
        category ErrorFurniture2 of collectives, objects specializes EventFurniture
    }
  `;

  it("should have Incompatible Natures error", async () => {
    const validationResult = await validate(tontoCompatibleNaturesStub);

    const diagnostics = validationResult.diagnostics;

    console.log(diagnostics);
    expect(diagnostics).not.toBeNull();

    if (diagnostics != undefined) {
      const duplicatedNameError = diagnostics[0];
      expect(duplicatedNameError.message).toBe(
        "This element cannot be restricted to Natures that its superclass is not restricted"
      );
    }
  });
});
