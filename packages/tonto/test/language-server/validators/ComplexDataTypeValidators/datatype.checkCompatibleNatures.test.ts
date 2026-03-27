import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { createTontoServices } from "../../../../src/language/tonto-module.js";
import { validationHelper } from "../../../../src/test/tonto-test.js";

describe("ComplexDataTypeValidator.checkCompatibleNatures", () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should produce no error for datatype with 'abstract-individuals' nature", async () => {
    const stub = `
    package TestPackage
    datatype MyDatatype of abstract-individuals
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("Incompatible") && d.message.includes("Datatype")
    );
    expect(errors).toHaveLength(0);
  });

  it("should produce error for datatype with 'functional-complexes' nature", async () => {
    const stub = `
    package TestPackage
    datatype MyDatatype of functional-complexes
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("Incompatible") && d.message.includes("MyDatatype")
    );
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it("should produce error for datatype with 'relators' nature", async () => {
    const stub = `
    package TestPackage
    datatype MyDatatype of relators
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("Incompatible") && d.message.includes("MyDatatype")
    );
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it("should produce error for datatype with 'events' nature", async () => {
    const stub = `
    package TestPackage
    datatype MyDatatype of events
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("Incompatible") && d.message.includes("MyDatatype")
    );
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it("should produce no error for datatype with no nature", async () => {
    const stub = `
    package TestPackage
    datatype MyDatatype
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("Incompatible") && d.message.includes("Datatype")
    );
    expect(errors).toHaveLength(0);
  });
});
