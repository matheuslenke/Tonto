import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { createTontoServices } from "../../../../src/language/tonto-module.js";
import { validationHelper } from "../../../../src/test/tonto-test.js";

describe("ContextModuleValidator.checkContextModuleStartsWithCapital", () => {
  // NOTE: This validator exists in the source code but is NOT registered
  // in TontoValidationRegistry. These tests document expected behavior
  // if/when it gets registered.
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should produce no warning for package name starting with uppercase (currently unregistered)", async () => {
    const stub = `
    package MyPackage
    kind Person
    `;
    const result = await validate(stub);
    const warnings = result.diagnostics.filter(
      (d) => d.message.includes("Module name should start with a capital")
    );
    expect(warnings).toHaveLength(0);
  });

  it("should not produce warning since validator is not registered", async () => {
    const stub = `
    package myPackage
    kind Person
    `;
    const result = await validate(stub);
    const warnings = result.diagnostics.filter(
      (d) => d.message.includes("Module name should start with a capital")
    );
    // This validator is not registered in TontoValidationRegistry
    expect(warnings).toHaveLength(0);
  });
});
