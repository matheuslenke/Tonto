import { EmptyFileSystem } from "langium";
import { createTontoServices } from "../../../../src/language-server/tonto-module";
import { validationHelper } from "../../../../src/test/tonto-test";

describe("checkClassWithoutStereotype", async () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("Should return specific class warning", async () => {
    const stub = `
    module UFOS {
      class ClassWithoutStereotype
    }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(1);

    if (diagnostics != undefined) {
      const error = diagnostics[0];
      expect(error.message).toBe(
        "Consider using an annotation or a more specific class"
      );
    }
  });
});
