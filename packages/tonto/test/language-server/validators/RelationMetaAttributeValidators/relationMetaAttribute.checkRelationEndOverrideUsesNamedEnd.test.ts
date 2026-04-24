import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { createTontoServices } from "../../../../src/language/tonto-module.js";
import { validationHelper } from "../../../../src/test/tonto-test.js";

describe("RelationMetaAttributeValidator.checkRelationEndOverrideUsesNamedEnd", () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should explain that subsets must reference a named relation end", async () => {
    const stub = `
    package TestPackage
    kind Person {
      [0..*] -- knows -- [0..*] Person
      [0..*] -- closeAssociates -- [0..*] ({ subsets knows } bestFriends) Person
    }
    `;

    const result = await validate(stub);
    const errors = result.diagnostics.filter((diagnostic) =>
      diagnostic.message.includes('"subsets knows" references the relation "Person.knows"')
    );

    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain("must reference a named relation end");
    expect(errors[0]?.message).toContain('"Person.knows.<endName>"');
  });

  it("should explain that redefines must reference a named relation end", async () => {
    const stub = `
    package TestPackage
    kind Person {
      [0..*] -- knows -- [0..*] Person
      [0..*] -- closeAssociates -- [0..*] ({ redefines knows } bestFriends) Person
    }
    `;

    const result = await validate(stub);
    const errors = result.diagnostics.filter((diagnostic) =>
      diagnostic.message.includes('"redefines knows" references the relation "Person.knows"')
    );

    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain("must reference a named relation end");
    expect(errors[0]?.message).toContain('"Person.knows.<endName>"');
  });

  it("should not report the custom message for unrelated unresolved end references", async () => {
    const stub = `
    package TestPackage
    kind Person {
      [0..*] -- closeAssociates -- [0..*] ({ subsets missingReference } bestFriends) Person
    }
    `;

    const result = await validate(stub);
    const errors = result.diagnostics.filter((diagnostic) =>
      diagnostic.message.includes("must reference a named relation end")
    );

    expect(errors).toHaveLength(0);
  });

  it("should report when a relation end redefines itself", async () => {
    const stub = `
    package TestPackage
    kind Person {
      [0..*] -- closeAssociates -- [0..*] ({ redefines specificColleagues } specificColleagues) Person
    }
    `;

    const result = await validate(stub);
    const errors = result.diagnostics.filter((diagnostic) =>
      diagnostic.message.includes('Relation end "specificColleagues" cannot redefine itself.')
    );

    expect(errors).toHaveLength(1);
  });
});
