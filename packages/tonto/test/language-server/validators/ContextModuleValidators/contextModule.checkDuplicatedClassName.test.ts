import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { createTontoServices } from "../../../../src/language/tonto-module.js";
import { validationHelper } from "../../../../src/test/tonto-test.js";

describe("ContextModuleValidator.checkDuplicatedClassName", () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should produce error for duplicate class names in same package", async () => {
    const stub = `
    package TestPackage
    kind Person
    kind Person
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("Duplicated class declaration")
    );
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it("should produce no error for different class names", async () => {
    const stub = `
    package TestPackage
    kind Person
    kind Organization
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("Duplicated class declaration")
    );
    expect(errors).toHaveLength(0);
  });

  it("should produce error for three classes with same name", async () => {
    const stub = `
    package TestPackage
    kind Person
    kind Person
    kind Person
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("Duplicated class declaration")
    );
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});
