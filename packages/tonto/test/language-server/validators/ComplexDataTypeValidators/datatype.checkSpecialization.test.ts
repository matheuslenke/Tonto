import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { createTontoServices } from "../../../../src/language/tonto-module.js";
import { validationHelper } from "../../../../src/test/tonto-test.js";

describe("ComplexDataTypeValidator.checkSpecialization", () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should produce no error for datatype specializing another datatype", async () => {
    const stub = `
    package TestPackage
    datatype BaseDatatype
    datatype ChildDatatype specializes BaseDatatype
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("Specialization of a DataType")
    );
    expect(errors).toHaveLength(0);
  });

  it("should produce error for datatype specializing a kind", async () => {
    const stub = `
    package TestPackage
    kind Person
    datatype PersonData specializes Person
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("Specialization of a DataType")
    );
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it("should produce no error for datatype specializing a class with abstract-individuals nature", async () => {
    const stub = `
    package TestPackage
    class AbstractClass of abstract-individuals
    datatype ConcreteDatatype specializes AbstractClass
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("Specialization of a DataType")
    );
    expect(errors).toHaveLength(0);
  });

  it("should produce error for datatype specializing a class without abstract-individuals nature", async () => {
    const stub = `
    package TestPackage
    class SomeClass of functional-complexes
    datatype SomeDatatype specializes SomeClass
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("Specialization of a DataType")
    );
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });
});
