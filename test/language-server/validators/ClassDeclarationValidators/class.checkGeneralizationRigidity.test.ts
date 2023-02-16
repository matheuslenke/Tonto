import { EmptyFileSystem } from "langium";
import { createTontoServices } from "../../../../src/language-server/tonto-module";
import { validationHelper } from "../../../../src/test/tonto-test";

describe("CheckGeneralizationRigidity", async () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("Should have error with genset 1", async () => {
    const stub = `
    module CheckGeneralizationRigidity {
      category Animal
      phaseMixin AdultAnimal
  
      genset GeneralizationOne {
          general AdultAnimal
          specifics Animal
      }
    }
  
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(2);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(
        `Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class Animal cannot specialize the anti-rigid class AdultAnimal`
      );
    });
  });

  it("Should have error with genset 2", async () => {
    const stub = `
    module CheckGeneralizationRigidity {
      phaseMixin AdultAnimal
      mixin SocialLeader

      genset GeneralizationTwo {
        general AdultAnimal
        specifics SocialLeader
      }
    }
  
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(2);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(
        `Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class SocialLeader cannot specialize the anti-rigid class AdultAnimal`
      );
    });
  });

  it("Should have error with normal specialization", async () => {
    const stub = `
    module CheckGeneralizationRigidity {
      phaseMixin AdultAnimal
      category Animal specializes AdultAnimal
    }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(1);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(
        `Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class Animal cannot specialize the anti-rigid class AdultAnimal`
      );
    });
  });

  it("Should have error with normal specialization", async () => {
    const stub = `
    module CheckGeneralizationRigidity {
      phaseMixin AdultAnimal
      mixin SocialLeader specializes AdultAnimal
    }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(1);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(
        `Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class SocialLeader cannot specialize the anti-rigid class AdultAnimal`
      );
    });
  });
});
