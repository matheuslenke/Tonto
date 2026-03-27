import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { Model, isClassDeclaration } from "../../../src/language/generated/ast.js";
import { getPrimaryContextModuleOrThrow } from "../../../src/language/index.js";
import { createTontoServices } from "../../../src/language/tonto-module.js";
import { parseHelper } from "../../../src/test/tonto-test.js";

describe("Parsing attributes", () => {
  const services = createTontoServices(EmptyFileSystem);
  const parse = parseHelper<Model>(services.Tonto);

  it("should parse a class with typed attributes", async () => {
    const doc = await parse(`
      package TestPackage
      datatype String
      kind Person {
        name : String
      }
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const declarations = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations;
    const person = declarations.filter(isClassDeclaration).find((d) => d.name === "Person");
    expect(person).toBeDefined();
    expect(person!.attributes).toHaveLength(1);
    expect(person!.attributes[0].name).toBe("name");
  });

  it("should parse attribute with cardinality [1..*]", async () => {
    const doc = await parse(`
      package TestPackage
      datatype String
      kind Person {
        aliases : String [1..*]
      }
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const person = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations
      .filter(isClassDeclaration)
      .find((d) => d.name === "Person");
    const attr = person!.attributes[0];
    expect(attr.cardinality).toBeDefined();
    expect(attr.cardinality!.lowerBound).toBe(1);
    expect(attr.cardinality!.upperBound).toBe("*");
  });

  it("should parse attribute with single cardinality [0]", async () => {
    const doc = await parse(`
      package TestPackage
      datatype String
      kind Person {
        nickname : String [0]
      }
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const person = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations
      .filter(isClassDeclaration)
      .find((d) => d.name === "Person");
    const attr = person!.attributes[0];
    expect(attr.cardinality).toBeDefined();
    expect(attr.cardinality!.lowerBound).toBe(0);
  });

  it("should parse attribute with meta-attributes", async () => {
    const doc = await parse(`
      package TestPackage
      datatype String
      kind Person {
        name : String { const ordered derived }
      }
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const person = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations
      .filter(isClassDeclaration)
      .find((d) => d.name === "Person");
    const attr = person!.attributes[0];
    expect(attr.isConst).toBe(true);
    expect(attr.isOrdered).toBe(true);
    expect(attr.isDerived).toBe(true);
  });

  it("should parse multiple attributes", async () => {
    const doc = await parse(`
      package TestPackage
      datatype String
      datatype Integer
      kind Person {
        name : String
        age : Integer
      }
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const person = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations
      .filter(isClassDeclaration)
      .find((d) => d.name === "Person");
    expect(person!.attributes).toHaveLength(2);
    expect(person!.attributes[0].name).toBe("name");
    expect(person!.attributes[1].name).toBe("age");
  });
});
