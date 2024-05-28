import { EmptyFileSystem } from "langium";
import { describe, expect, test } from "vitest";
import { Model } from "../src/language/generated/ast.js";
import { createTontoServices } from "../src/language/tonto-module.js";
import { validationHelper } from "../src/test/tonto-test.js";

describe("A", () => {
  const tontoStub = `
    package UFOS 
    kind Person
    kind School
  `;
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  test("should have a kind", async () => {
    const validationResult = await validate(tontoStub);

    const astNode = validationResult.document.parseResult.value;
    expect(astNode.$type).toBe("Model");

    const model = astNode as Model;

    const module = model.module;

    expect(module.name).toBe("UFOS");
  });
});
