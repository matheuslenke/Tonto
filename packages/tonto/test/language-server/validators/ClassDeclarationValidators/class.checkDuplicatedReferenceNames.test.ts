import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { createTontoServices } from "../../../../src/language/tonto-module.js";
import { validationHelper } from "../../../../src/test/tonto-test.js";

describe("ClassDeclarationValidator.checkDuplicatedReferenceNames", () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should produce error for two inline relations with same name", async () => {
    const stub = `
    package TestPackage
    kind Person {
      -- studies -- School
      -- studies -- University
    }
    kind School
    kind University
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("Duplicated reference name")
    );
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it("should produce no error for inline relations with different names", async () => {
    const stub = `
    package TestPackage
    kind Person {
      -- studies -- School
      -- worksAt -- University
    }
    kind School
    kind University
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("Duplicated reference name")
    );
    expect(errors).toHaveLength(0);
  });
});
