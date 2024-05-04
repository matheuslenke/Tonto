/* eslint-disable max-len */
import { EmptyFileSystem } from "langium";
import { createTontoServices } from "../../../../src/language/tonto-module.js";
import { validationHelper } from "../../../../src/test/tonto-test";

describe("checkClassWithoutStereotype", async () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should have Incompatible Natures error", async () => {
    const stub = `
    package CheckCompatibleNature

    category Category of abstract-individuals
    datatype Datatype of events
    event Event of collectives
    situation Situation of objects
    mixin Mixin of situations
    roleMixin RoleMixin of situations
    phaseMixin PhaseMixin of situations
    historicalRoleMixin HistoricalRoleMixin of situations
    kind Number of abstract-individuals
    collective Collective of events
    quantity Quantity of functional-complexes
    relator Relator of intrinsic-modes
    mode Mode of intrinsic-modes, extrinsic-modes, collectives
    intrinsicMode IntrinsicMode of events
    extrinsicMode ExtrinsicMode of events
    quality Quality of events
    subkind Subkind of events
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();

    const messages = diagnostics.map((diagnostic) => diagnostic.message);

    const regex =
      /Incompatible stereotype and Nature restriction combination. Class .* is incompatible with the following natures: .*/i;

    const matchingMessages = messages.filter((message) => regex.test(message));
    expect(matchingMessages.length).toBe(16);
  });

  it("should have no incompatible Natures error", async () => {
    const stub = `
    package CheckCompatibleNature

    datatype CDatatype of abstract-individuals
    event CEvent of events
    situation CSituation of situations
    category CCategory of functional-complexes, collectives, qualities, quantities, intrinsic-modes, extrinsic-modes, relators
    mixin CMixin of functional-complexes, collectives, qualities, quantities, intrinsic-modes, extrinsic-modes, relators
    roleMixin CRoleMixin of functional-complexes, collectives, qualities, quantities, intrinsic-modes, extrinsic-modes, relators
    phaseMixin CPhaseMixin of functional-complexes, collectives, qualities, quantities, intrinsic-modes, extrinsic-modes, relators
    historicalRoleMixin CHistoricalRoleMixin of functional-complexes, collectives, qualities, quantities, intrinsic-modes, extrinsic-modes, relators
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(0);
  });
});
