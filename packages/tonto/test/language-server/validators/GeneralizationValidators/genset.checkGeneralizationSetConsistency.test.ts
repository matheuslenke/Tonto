import { EmptyFileSystem } from "langium";
import { ErrorMessages } from "../../../../src/language/models/ErrorMessages.js";
import { createTontoServices } from "../../../../src/language/tonto-module.js";
import { validationHelper } from "../../../../src/test/tonto-test.js";

describe("checkGeneralizationSetConsistency", async () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should have error with specialization with different elements", async () => {
    const stub = `
    package CheckGeneralizationConsistency
    kind Person
    role Doctor specializes Person

    relation Doctor -- treats -- Person

    genset GeneralizationSet {
      general Person
      specifics Doctor.treats
    }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(1);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(
        ErrorMessages.genSetSpecialization
      );
    });
  });
});
