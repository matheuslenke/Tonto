import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { createTontoServices } from "../../../../src/language/tonto-module.js";
import { validationHelper } from "../../../../src/test/tonto-test.js";

describe("GeneralizationValidator.checkRigidSpecializesAntiRigid", () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should produce error when rigid specific specializes anti-rigid general in genset", async () => {
    const stub = `
    package TestPackage
    kind Person
    role Student specializes Person
    genset gs {
      general Student
      specifics Person
    }
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("rigid/semi-rigid specializing an anti-rigid")
    );
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it("should produce no error when anti-rigid specific specializes rigid general in genset", async () => {
    const stub = `
    package TestPackage
    kind Person
    role Student specializes Person
    genset gs {
      general Person
      specifics Student
    }
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("rigid/semi-rigid specializing an anti-rigid")
    );
    expect(errors).toHaveLength(0);
  });

  it("should produce no error when both are rigid in genset", async () => {
    const stub = `
    package TestPackage
    kind Person
    kind Animal
    category LivingEntity of functional-complexes
    genset gs {
      general LivingEntity
      specifics Person, Animal
    }
    `;
    const result = await validate(stub);
    const errors = result.diagnostics.filter(
      (d) => d.message.includes("rigid/semi-rigid specializing an anti-rigid")
    );
    expect(errors).toHaveLength(0);
  });
});
