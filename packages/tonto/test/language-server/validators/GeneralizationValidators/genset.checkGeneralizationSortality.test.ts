import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { createTontoServices } from "../../../../src/language/tonto-module.js";
import { validationHelper } from "../../../../src/test/tonto-test.js";

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

