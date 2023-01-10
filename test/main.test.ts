import { EmptyFileSystem, Grammar } from "langium";
import { ParserRule } from "langium/lib/grammar/generated/ast";
import { createTontoServices } from "../src/language-server/tonto-module";
import { parseHelper, validationHelper } from "../src/test/tonto-test";

describe('A', () => {

  const tontoStub = `
    module UFOS {
      kind Person
      kind School
    }
  `;
  const services = createTontoServices(EmptyFileSystem);
  const parser = parseHelper<Grammar>(services.Tonto);
  const validate = validationHelper(services.Tonto);

  let rules: ParserRule[] = [];

  test('should have a kind', async () => {
    // const validationResult = await validate(tontoStub);

    // const astNode = validationResult.document.parseResult.value
    // expect(astNode.$type).toBe("Model")

    // const model = astNode as Model

    // const modules = model.modules
    // const UFOSModule = modules[0];

    // expect(UFOSModule.name).toBe("UFOS")
  });

});

