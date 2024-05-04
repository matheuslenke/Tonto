import { EmptyFileSystem } from "langium";
import { ErrorMessages } from "../../../../src/language/models/ErrorMessages.js";
import { createTontoServices } from "../../../../src/language/tonto-module.js";
import { validationHelper } from "../../../../src/test/tonto-test";

describe("checkCircularGeneralization", async () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should have circular generalization error", async () => {
    const stub = `
    package CheckCircularGeneralizationSet
    kind Person

    genset GeneralizationSet {
      general Person
      specifics Person
    }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    const messages = diagnostics.map(diagnostic => diagnostic.message);
    expect(messages).toContain(ErrorMessages.genSetCircularGeneralization);
  });
});
