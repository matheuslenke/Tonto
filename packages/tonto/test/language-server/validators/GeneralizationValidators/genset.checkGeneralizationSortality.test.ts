import { EmptyFileSystem } from "langium";
import { createTontoServices } from "../../../../src/language-server/tonto-module";
import { validationHelper } from "../../../../src/test/tonto-test";

describe("checkGeneralizationSortality", async () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);


  it("Should return error in generalizationSet", async () => {
    const stub = `
    package CheckGeneralizationSortality 
    kind Person
    subkind Test specializes Person
    category Agent

    genset GeneralizationSet {
        general Person
        specifics Agent
    }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(1);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(
        "Prohibited generalization: non-sortal specializing a sortal. The non-sortal class Agent cannot specialize the sortal class Person"
      );
    });
  });
});

