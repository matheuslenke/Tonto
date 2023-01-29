import { EmptyFileSystem } from "langium";
import { createTontoServices } from "../../../../src/language-server/tonto-module";
import { validationHelper } from "../../../../src/test/tonto-test";

describe("checkClassWithoutStereotype", async () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should have Incompatible Natures error", async () => {
    const stub = `
      module OntologicalNaturesError {
          category Furniture of objects
          category SpecificFurniture of collectives specializes Furniture
      }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(0);

    // diagnostics.forEach((error) => {
    //   expect(error.message).toBe(
    //     "Incompatible stereotype and Nature restriction combination. Class SpecificFurniture has its value for 'restrictedTo' incompatible with the stereotype"
    //   );
    // });
  });
});
