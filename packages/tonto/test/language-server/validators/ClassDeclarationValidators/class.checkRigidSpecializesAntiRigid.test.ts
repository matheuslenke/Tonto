import { EmptyFileSystem } from "langium";
import { createTontoServices } from "../../../../src/language-server/tonto-module";
import { validationHelper } from "../../../../src/test/tonto-test";

describe("checkRigidSpecializesAntiRigid", async () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("Should return error in rigid/semi-rigid specializing an anti-rigid", async () => {
    const stub = `
    package CheckRigidSpecializesAntiRigid
      role Role
      kind kind_test specializes Role
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBeGreaterThan(0);

    const messages = diagnostics.map(item => item.message);
    const errorMessage = "Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class kind_test cannot specialize the anti-rigid class Role";

    expect(messages).toContain(errorMessage);
  });

  it("Should return error in rigid/semi-rigid specializing an anti-rigid", async () => {
    const stub = `
    package CheckRigidSpecializesAntiRigid
      roleMixin RoleMixin
      quantity quantity_test specializes RoleMixin
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(1);

    expect(diagnostics).not.toBeNull();

    const message = "Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class quantity_test cannot specialize the anti-rigid class RoleMixin";

    const messages = diagnostics.map(diagnostic => diagnostic.message);

    expect(messages).toContain(message);

  });

  it("Should return error in rigid/semi-rigid specializing an anti-rigid", async () => {
    const stub = `
    package CheckRigidSpecializesAntiRigid
      historicalRole HistoricalRole
      collective colletive_test specializes HistoricalRole
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();

    const message = "Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class colletive_test cannot specialize the anti-rigid class HistoricalRole";

    const messages = diagnostics.map(diagnostic => diagnostic.message);

    expect(messages).toContain(message);
  });

  it("Should return error in rigid/semi-rigid specializing an anti-rigid", async () => {
    const stub = `
    package CheckRigidSpecializesAntiRigid
      historicalRoleMixin HistoricalRoleMixin
      mode mode_test specializes HistoricalRoleMixin
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();

    const message = "Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class mode_test cannot specialize the anti-rigid class HistoricalRoleMixin";

    const messages = diagnostics.map(diagnostic => diagnostic.message);

    expect(messages).toContain(message);
  });

  it("Should return error in rigid/semi-rigid specializing an anti-rigid", async () => {
    const stub = `
    package CheckRigidSpecializesAntiRigid
      phase Phase
      quality quality_test specializes Phase
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();

    const message = "Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class quality_test cannot specialize the anti-rigid class Phase";

    const messages = diagnostics.map(diagnostic => diagnostic.message);

    expect(messages).toContain(message);
  });

  it("Should return error in rigid/semi-rigid specializing an anti-rigid", async () => {
    const stub = `
    package CheckRigidSpecializesAntiRigid
      phaseMixin PhaseMixin
      relator relator_test specializes PhaseMixin
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();

    const message = "Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class relator_test cannot specialize the anti-rigid class PhaseMixin";

    const messages = diagnostics.map(diagnostic => diagnostic.message);

    expect(messages).toContain(message);
  });

  it("Should return error in rigid/semi-rigid specializing an anti-rigid", async () => {
    const stub = `
    package CheckRigidSpecializesAntiRigid
      phaseMixin PhaseMixin
      subkind subkind_test specializes PhaseMixin
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();

    const message = "Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class subkind_test cannot specialize the anti-rigid class PhaseMixin";

    const messages = diagnostics.map(diagnostic => diagnostic.message);

    expect(messages).toContain(message);
  });

  it("Should return error in rigid/semi-rigid specializing an anti-rigid", async () => {
    const stub = `
    package CheckRigidSpecializesAntiRigid
      phaseMixin PhaseMixin
      category category_test specializes PhaseMixin
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();

    const message = "Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class category_test cannot specialize the anti-rigid class PhaseMixin";

    const messages = diagnostics.map(diagnostic => diagnostic.message);

    expect(messages).toContain(message);
  });
});
