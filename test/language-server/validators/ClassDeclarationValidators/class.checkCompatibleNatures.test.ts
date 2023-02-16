import { EmptyFileSystem } from "langium";
import { createTontoServices } from "../../../../src/language-server/tonto-module";
import { validationHelper } from "../../../../src/test/tonto-test";

describe("checkClassWithoutStereotype", async () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);

  it("should have Incompatible Natures error", async () => {
    const stub = `
    module CheckCompatibleNature {
      category Category of abstracts
      datatype Datatype of events
      event Event of collectives
      situation Situation of objects
      mixin Mixin of situations
      roleMixin RoleMixin of situations
      phaseMixin PhaseMixin of situations
      historicalRoleMixin HistoricalRoleMixin of situations
      kind Number of abstracts
      collective Collective of events
      quantity Quantity of functional-complexes
      relator Relator of intrinsic-modes
      mode Mode of intrinsic-modes, extrinsic-modes, collectives
      intrinsicMode IntrinsicMode of events
      extrinsicMode ExtrinsicMode of events
      quality Quality of events
      subkind Subkind of events
    }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();

    const messages = diagnostics.map(diagnostic => diagnostic.message)

    expect(messages).toMatch(/Incompatible stereotype and Nature restriction combination. Class .* has its value for 'restrictedTo' incompatible with the following natures: .*/i)
  });

  it("should have no incompatible Natures error", async () => {
    const stub = `
    module CheckCompatibleNature {
      datatype CDatatype of abstracts
      event CEvent of events
      situation CSituation of situations
      category CCategory of functional-complexes, collectives, qualities, quantities, intrinsic-modes, extrinsic-modes, relators, types
      mixin CMixin of functional-complexes, collectives, qualities, quantities, intrinsic-modes, extrinsic-modes, relators, types
      roleMixin CRoleMixin of functional-complexes, collectives, qualities, quantities, intrinsic-modes, extrinsic-modes, relators, types
      phaseMixin CPhaseMixin of functional-complexes, collectives, qualities, quantities, intrinsic-modes, extrinsic-modes, relators, types
      historicalRoleMixin CHistoricalRoleMixin of functional-complexes, collectives, qualities, quantities, intrinsic-modes, extrinsic-modes, relators, types
      kind CKind of functional-complexes
      collective CCollective of collectives
      quantity CQuantity of quantities
      relator CRelator of relators
      mode CMode of extrinsic-modes, intrinsic-modes
      quality CQuality of qualities
      subkind CSubkind of functional-complexes, collectives, qualities, quantities, intrinsic-modes, extrinsic-modes, relators, types
      role CRole of functional-complexes, collectives, qualities, quantities, intrinsic-modes, extrinsic-modes, relators, types
      phase CPhase of functional-complexes, collectives, qualities, quantities, intrinsic-modes, extrinsic-modes, relators, types
      historicalRole CHistoricalRole of functional-complexes, collectives, qualities, quantities, intrinsic-modes, extrinsic-modes, relators, types
      type CType of types
    }
    `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(0);
  });
});
