import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { DataType, Model } from "../../../src/language/generated/ast.js";
import { getPrimaryContextModuleOrThrow } from "../../../src/language/index.js";
import { createTontoServices } from "../../../src/language/tonto-module.js";
import { parseHelper } from "../../../src/test/tonto-test.js";

describe("Parsing datatypes and enums", () => {
  const services = createTontoServices(EmptyFileSystem);
  const parse = parseHelper<Model>(services.Tonto);

  it("should parse a simple datatype", async () => {
    const doc = await parse(`
      package TestPackage
      datatype Address
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const declarations = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations;
    const datatype = declarations.find((d) => d.$type === "DataType" && d.name === "Address") as DataType;
    expect(datatype).toBeDefined();
    expect(datatype.ontologicalCategory).toBe("datatype");
  });

  it("should parse a datatype with attributes", async () => {
    const doc = await parse(`
      package TestPackage
      datatype String
      datatype Address {
        street : String
        city : String
      }
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const declarations = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations;
    const address = declarations.find((d) => d.$type === "DataType" && d.name === "Address") as DataType;
    expect(address).toBeDefined();
    expect(address.attributes).toHaveLength(2);
  });

  it("should parse an enum with literals", async () => {
    const doc = await parse(`
      package TestPackage
      enum Color {
        RED, GREEN, BLUE
      }
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const declarations = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations;
    const color = declarations.find((d) => d.$type === "DataType" && d.name === "Color") as DataType;
    expect(color).toBeDefined();
    expect(color.isEnum).toBe(true);
    expect(color.elements).toHaveLength(3);
    expect(color.elements[0].name).toBe("RED");
    expect(color.elements[1].name).toBe("GREEN");
    expect(color.elements[2].name).toBe("BLUE");
  });

  it("should parse datatype with nature", async () => {
    const doc = await parse(`
      package TestPackage
      datatype MyDatatype of abstract-individuals
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const declarations = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations;
    const datatype = declarations.find((d) => d.$type === "DataType" && d.name === "MyDatatype") as DataType;
    expect(datatype.ontologicalNature).toBeDefined();
    expect(datatype.ontologicalNature!.natures).toContain("abstract-individuals");
  });

  it("should parse datatype specialization", async () => {
    const doc = await parse(`
      package TestPackage
      datatype BaseType
      datatype ChildType specializes BaseType
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const declarations = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations;
    const childType = declarations.find((d) => d.$type === "DataType" && d.name === "ChildType") as DataType;
    expect(childType.specializationEndurants).toHaveLength(1);
  });
});
