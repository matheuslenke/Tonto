import { EmptyFileSystem } from "langium";
import { createTontoServices } from "../src/language-server/tonto-module";
import { validationHelper } from "../src/test/tonto-test";
import { Model } from "../src/language-server/generated/ast";

describe("A", () => {
  const tontoStub = `
    module UFOS {
      kind Person
      kind School
    }
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
