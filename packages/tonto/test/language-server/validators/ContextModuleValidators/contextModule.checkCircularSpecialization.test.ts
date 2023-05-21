import { ErrorMessages } from "../../../../src/language-server/models/ErrorMessages";
import { EmptyFileSystem, Grammar } from "langium";
import { createTontoServices } from "../../../../src/language-server/tonto-module";
import { parseHelper, validationHelper } from "../../../../src/test/tonto-test";

describe("CheckCircularSpecialization", () => {
  const services = createTontoServices(EmptyFileSystem);
  const parse = parseHelper<Grammar>(services.Tonto);
  const validate = validationHelper(services.Tonto);

  it("should have cyclic specialization error case 1", async () => {
    const stub = `
    module Generalization {
      category Item1 specializes Item2
      category Item2 specializes Item1
    }
  `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics).not.toBeUndefined();
    expect(diagnostics.length).toBe(4);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(ErrorMessages.cyclicSpecialization);
    });
  });

  it("should have cyclic specialization error case 2", async () => {
    const stub = `
      module Generalization {
        category Item3 specializes Item4
        category Item4
        genset Genset1 {
          general Item3
          specifics Item4
        }
      }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics).not.toBeUndefined();
    expect(diagnostics.length).toBe(2);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(ErrorMessages.cyclicSpecialization);
    });
  });

  it("should have cyclic specialization error case 3", async () => {
    const stub = `
      module Generalization {
        category  Item5
        category Item6
        genset Genset2 {
          general Item5
          specifics Item6
        }
        genset Genset3 {
          general Item6
          specifics Item5
        }
      }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics).not.toBeUndefined();
    expect(diagnostics.length).toBe(4);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(ErrorMessages.cyclicSpecialization);
    });
  });

  it("should have cyclic specialization error case 4", async () => {
    const stub = `
      module Generalization {
        category Test1 specializes Test3
        category Test2 specializes Test1
        category Test3 specializes Test2
      }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics).not.toBeUndefined();
    expect(diagnostics.length).toBe(6);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(ErrorMessages.cyclicSpecialization);
    });
  });

  it("should have cyclic specialization error case 5", async () => {
    const stub = `
      module Generalization {
        category Test4
        category Test5
        category Test6
        genset Genset2 {
          general Test4
          specifics Test5
        }
        genset Genset3 {
          general Test5
          specifics Test6
        }
        genset Genset4 {
          general Test6
          specifics Test4
        }
      }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics).not.toBeUndefined();
    expect(diagnostics.length).toBe(6);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(ErrorMessages.cyclicSpecialization);
    });
  });

  it("should have cyclic specialization error case 6", async () => {
    const stub = `
      module Generalization {
        category Single1 specializes Multiple1
        category Single2
        category Multiple1 specializes Single1, Single2
      }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics).not.toBeUndefined();
    expect(diagnostics.length).toBe(4);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(ErrorMessages.cyclicSpecialization);
    });
  });

  it("should have cyclic specialization error case 7", async () => {
    const stub = `
      module Generalization {
        category Single3
        category Single4
        category Multiple2
      
        genset Genset2 {
          general Multiple2
          specifics Single3, Single4
        }
        genset Genset3 {
          general Single3
          specifics Multiple2
        }
      }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics).not.toBeUndefined();
    expect(diagnostics.length).toBe(4);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(ErrorMessages.cyclicSpecialization);
    });
  });

  it("should have duplicated class names error", async () => {
    const stub = `
    module UFOS {
      kind test
      kind test
    }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(1);

    if (diagnostics != undefined) {
      const error = diagnostics[0];
      expect(error.message).toBe("Duplicated class declaration");
    }
  });
});
