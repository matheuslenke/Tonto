import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { Model, isClassDeclaration } from "../../../src/language/generated/ast.js";
import { getPrimaryContextModuleOrThrow } from "../../../src/language/index.js";
import { createTontoServices } from "../../../src/language/tonto-module.js";
import { parseHelper } from "../../../src/test/tonto-test.js";

describe("Parsing specializations", () => {
  const services = createTontoServices(EmptyFileSystem);
  const parse = parseHelper<Model>(services.Tonto);

  it("should parse single specialization", async () => {
    const doc = await parse(`
      package TestPackage
      kind Person
      subkind Student specializes Person
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const student = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations
      .filter(isClassDeclaration)
      .find((d) => d.name === "Student");
    expect(student).toBeDefined();
    expect(student!.specializationEndurants).toHaveLength(1);
  });

  it("should parse multiple specializations", async () => {
    const doc = await parse(`
      package TestPackage
      kind Person
      kind Animal
      subkind LivingStudent specializes Person, Animal
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const student = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations
      .filter(isClassDeclaration)
      .find((d) => d.name === "LivingStudent");
    expect(student).toBeDefined();
    expect(student!.specializationEndurants).toHaveLength(2);
  });

  it("should parse class with nature restriction", async () => {
    const doc = await parse(`
      package TestPackage
      category LivingEntity of functional-complexes
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const entity = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations
      .filter(isClassDeclaration)
      .find((d) => d.name === "LivingEntity");
    expect(entity).toBeDefined();
    expect(entity!.ontologicalNatures).toBeDefined();
    expect(entity!.ontologicalNatures!.natures).toContain("functional-complexes");
  });

  it("should parse class with multiple nature restrictions", async () => {
    const doc = await parse(`
      package TestPackage
      category Entity of functional-complexes, collectives
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const entity = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations
      .filter(isClassDeclaration)
      .find((d) => d.name === "Entity");
    expect(entity!.ontologicalNatures!.natures).toHaveLength(2);
    expect(entity!.ontologicalNatures!.natures).toContain("functional-complexes");
    expect(entity!.ontologicalNatures!.natures).toContain("collectives");
  });

  it("should parse specialization with nature restriction (nature before specializes)", async () => {
    const doc = await parse(`
      package TestPackage
      kind Person
      subkind Student of functional-complexes specializes Person
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const student = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations
      .filter(isClassDeclaration)
      .find((d) => d.name === "Student");
    expect(student!.specializationEndurants).toHaveLength(1);
    expect(student!.ontologicalNatures).toBeDefined();
    expect(student!.ontologicalNatures!.natures).toContain("functional-complexes");
  });
});
