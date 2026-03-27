import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { GeneralizationSet, Model } from "../../../src/language/generated/ast.js";
import { getPrimaryContextModuleOrThrow } from "../../../src/language/index.js";
import { createTontoServices } from "../../../src/language/tonto-module.js";
import { parseHelper } from "../../../src/test/tonto-test.js";

describe("Parsing generalization sets", () => {
  const services = createTontoServices(EmptyFileSystem);
  const parse = parseHelper<Model>(services.Tonto);

  it("should parse a basic genset with general and specifics", async () => {
    const doc = await parse(`
      package TestPackage
      kind Person
      subkind Student specializes Person
      subkind Teacher specializes Person
      genset PersonGenset {
        general Person
        specifics Student, Teacher
      }
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const genset = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations.find(
      (d) => d.$type === "GeneralizationSet"
    ) as GeneralizationSet;
    expect(genset).toBeDefined();
    expect(genset.name).toBe("PersonGenset");
    expect(genset.specificItems).toHaveLength(2);
  });

  it("should parse genset with disjoint modifier", async () => {
    const doc = await parse(`
      package TestPackage
      kind Person
      subkind Student specializes Person
      subkind Teacher specializes Person
      disjoint genset PersonGenset {
        general Person
        specifics Student, Teacher
      }
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const genset = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations.find(
      (d) => d.$type === "GeneralizationSet"
    ) as GeneralizationSet;
    expect(genset.disjoint).toBe(true);
    expect(genset.complete).toBeFalsy();
  });

  it("should parse genset with complete modifier", async () => {
    const doc = await parse(`
      package TestPackage
      kind Person
      subkind Student specializes Person
      subkind Teacher specializes Person
      complete genset PersonGenset {
        general Person
        specifics Student, Teacher
      }
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const genset = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations.find(
      (d) => d.$type === "GeneralizationSet"
    ) as GeneralizationSet;
    expect(genset.complete).toBe(true);
    expect(genset.disjoint).toBeFalsy();
  });

  it("should parse genset with disjoint and complete modifiers", async () => {
    const doc = await parse(`
      package TestPackage
      kind Person
      subkind Student specializes Person
      subkind Teacher specializes Person
      disjoint complete genset PersonGenset {
        general Person
        specifics Student, Teacher
      }
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const genset = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations.find(
      (d) => d.$type === "GeneralizationSet"
    ) as GeneralizationSet;
    expect(genset.disjoint).toBe(true);
    expect(genset.complete).toBe(true);
  });

  it("should parse short genset syntax", async () => {
    const doc = await parse(`
      package TestPackage
      kind Person
      subkind Student specializes Person
      subkind Teacher specializes Person
      disjoint complete genset PersonGenset where Student, Teacher specializes Person
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const genset = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations.find(
      (d) => d.$type === "GeneralizationSet"
    ) as GeneralizationSet;
    expect(genset).toBeDefined();
    expect(genset.specificItems).toHaveLength(2);
    expect(genset.disjoint).toBe(true);
    expect(genset.complete).toBe(true);
  });
});
