import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { Model, isClassDeclaration } from "../../../src/language/generated/ast.js";
import { getPrimaryContextModuleOrThrow } from "../../../src/language/index.js";
import { createTontoServices } from "../../../src/language/tonto-module.js";
import { parseHelper } from "../../../src/test/tonto-test.js";

describe("Parsing ontological natures", () => {
  const services = createTontoServices(EmptyFileSystem);
  const parse = parseHelper<Model>(services.Tonto);

  const allNatures = [
    "objects",
    "functional-complexes",
    "collectives",
    "quantities",
    "relators",
    "intrinsic-modes",
    "extrinsic-modes",
    "qualities",
    "events",
    "situations",
    "types",
    "abstract-individuals",
  ];

  it.each(allNatures)("should parse nature '%s'", async (nature) => {
    const doc = await parse(`
      package TestPackage
      category TestClass of ${nature}
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const cls = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations
      .filter(isClassDeclaration)
      .find((d) => d.name === "TestClass");
    expect(cls).toBeDefined();
    expect(cls!.ontologicalNatures).toBeDefined();
    expect(cls!.ontologicalNatures!.natures).toContain(nature);
  });

  it("should parse multiple natures on a single class", async () => {
    const doc = await parse(`
      package TestPackage
      category Entity of functional-complexes, collectives, quantities
    `);
    expect(doc.parseResult.parserErrors).toHaveLength(0);
    const entity = getPrimaryContextModuleOrThrow(doc.parseResult.value).declarations
      .filter(isClassDeclaration)
      .find((d) => d.name === "Entity");
    expect(entity!.ontologicalNatures!.natures).toHaveLength(3);
  });
});
