import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { createTontoServices } from "../../../../src/language/tonto-module.js";
import { validationHelper } from "../../../../src/test/tonto-test.js";

describe("GeneralizationValidator.checkGeneralizationSortality (extended)", () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should produce error when non-sortal is specific of sortal general in genset", async () => {
    const stub = `
    package TestPackage
    kind Person
    category PersonCategory of functional-complexes
    genset gs {
      general Person
      specifics PersonCategory
    }
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("non-sortal specializing a sortal")
    );
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it("should produce no error when sortal is specific of sortal general in genset", async () => {
    const stub = `
    package TestPackage
    kind Person
    subkind Student specializes Person
    subkind Teacher specializes Person
    genset gs {
      general Person
      specifics Student, Teacher
    }
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("non-sortal specializing a sortal")
    );
    expect(errors).toHaveLength(0);
  });

  it("should produce no error when non-sortal general with non-sortal specifics", async () => {
    const stub = `
    package TestPackage
    category LivingEntity of functional-complexes
    roleMixin AgentRole specializes LivingEntity
    roleMixin PatientRole specializes LivingEntity
    genset gs {
      general LivingEntity
      specifics AgentRole, PatientRole
    }
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("non-sortal specializing a sortal")
    );
    expect(errors).toHaveLength(0);
  });
});
