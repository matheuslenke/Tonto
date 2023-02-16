import { EmptyFileSystem } from "langium";
import { ErrorMessages } from "../../../../src/language-server/models/ErrorMessages";
import { createTontoServices } from "../../../../src/language-server/tonto-module";
import { validationHelper } from "../../../../src/test/tonto-test";

describe("checkCircularGeneralization", async () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should have circular generalization error", async () => {
    const stub = `
    module CheckCircularGeneralizationSet {
      kind Person

      genset GeneralizationSet {
        general Person
        specifics Person
      }
    }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    const messages = diagnostics.map(diagnostic => diagnostic.message)
    expect(messages).toContain(ErrorMessages.genSetCircularGeneralization)
  });
});
