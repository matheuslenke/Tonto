import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { createTontoServices } from "../../../../src/language/tonto-module.js";
import { validationHelper } from "../../../../src/test/tonto-test.js";

describe("ContextModuleValidator.checkRedundantNatures", () => {
  // NOTE: This validator is commented out in TontoValidationRegistry.
  // These tests document the expected behavior and verify no false warnings.
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should not produce redundant nature warning (validator is disabled)", async () => {
    const stub = `
    package TestPackage
    kind Person
    subkind Student specializes Person of functional-complexes
    `;
    const result = await validate(stub);
    const warnings = result.diagnostics.filter(
      (d) => d.message.includes("Redundant nature declaration")
    );
    // Validator is commented out in the registry
    expect(warnings).toHaveLength(0);
  });

  it("should produce no warning when no nature is declared on child", async () => {
    const stub = `
    package TestPackage
    kind Person
    subkind Student specializes Person
    `;
    const result = await validate(stub);
    const warnings = result.diagnostics.filter(
      (d) => d.message.includes("Redundant nature declaration")
    );
    expect(warnings).toHaveLength(0);
  });
});
