import { EmptyFileSystem } from "langium";
import { ErrorMessages } from "../../../../src/language-server/models/ErrorMessages";
import { createTontoServices } from "../../../../src/language-server/tonto-module";
import { validationHelper } from "../../../../src/test/tonto-test";

describe("checkGeneralizationSetConsistency", async () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should have error with specialization with different elements", async () => {
    const stub = `
    module CheckGeneralizationConsistency {
      kind Person
      role Doctor specializes Person

      relation  Doctor -- treats -- Person

      genset GeneralizationSet {
        general Person
        specifics treats
      }
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
