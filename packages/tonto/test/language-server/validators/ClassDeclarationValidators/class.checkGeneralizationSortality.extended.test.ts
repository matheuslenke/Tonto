import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { createTontoServices } from "../../../../src/language/tonto-module.js";
import { validationHelper } from "../../../../src/test/tonto-test.js";

describe("ClassDeclarationValidator.checkGeneralizationSortality (extended)", () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should produce no error when sortal specializes a sortal", async () => {
    const stub = `
    package TestPackage
    kind Person
    subkind Student specializes Person
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("non-sortal specializing a sortal")
    );
    expect(errors).toHaveLength(0);
  });

  it("should produce no error when non-sortal specializes a non-sortal", async () => {
    const stub = `
    package TestPackage
    category LivingEntity of functional-complexes
    roleMixin AgentRole specializes LivingEntity
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("non-sortal specializing a sortal")
    );
    expect(errors).toHaveLength(0);
  });

  it("should produce error when roleMixin specializes a kind", async () => {
    const stub = `
    package TestPackage
    kind Person
    roleMixin AgentRole specializes Person
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("non-sortal specializing a sortal")
    );
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it("should produce error when phaseMixin specializes a collective", async () => {
    const stub = `
    package TestPackage
    collective Group
    phaseMixin ActiveGroup specializes Group
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("non-sortal specializing a sortal")
    );
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });
});
