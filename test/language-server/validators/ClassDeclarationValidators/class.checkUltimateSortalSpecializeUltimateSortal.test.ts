import { EmptyFileSystem } from "langium";
import { ErrorMessages } from "../../../../src/language-server/models/ErrorMessages";
import { createTontoServices } from "../../../../src/language-server/tonto-module";
import { validationHelper } from "../../../../src/test/tonto-test";

describe("checkUltimateSortalSpecializeUltimateSortal", async () => {
  const services = createTontoServices(EmptyFileSystem);
  const validate = validationHelper(services.Tonto);
  it("should have kind UltimateSortal specialization error", async () => {
    const stub = `
      module KindUltimateSortalValidator {
        kind KindUltimateSortal
    
        kind PersonError specializes KindUltimateSortal
        collective CollectiveError specializes KindUltimateSortal
        quantity QuantityError specializes KindUltimateSortal
        relator RelatorError specializes KindUltimateSortal
        quality QualityError specializes KindUltimateSortal
        mode ModeError specializes KindUltimateSortal
        intrinsicMode  IntrinsicModeError specializes KindUltimateSortal
        extrinsicMode ExtrinsicModeError specializes KindUltimateSortal
      }
      `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(8);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(
        ErrorMessages.ultimateSortalSpecializesUltimateSortal
      );
    });
  });

  it("should have collective UltimateSortal specialization error", async () => {
    const stub = `
      module CollectiveUltimateSortalValidator {
        collective CollectiveUltimateSortal
    
        kind PersonError specializes CollectiveUltimateSortal
        collective CollectiveError specializes CollectiveUltimateSortal
        quantity QuantityError specializes CollectiveUltimateSortal
        relator RelatorError specializes CollectiveUltimateSortal
        quality QualityError specializes CollectiveUltimateSortal
        mode ModeError specializes CollectiveUltimateSortal
        intrinsicMode  IntrinsicModeError specializes CollectiveUltimateSortal
        extrinsicMode ExtrinsicModeError specializes CollectiveUltimateSortal
      }
      `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(8);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(
        ErrorMessages.ultimateSortalSpecializesUltimateSortal
      );
    });
  });

  it("should have quantity UltimateSortal specialization error", async () => {
    const stub = `
      module QuantityUltimateSortalValidator {
        quantity QuantityUltimateSortal
    
        kind PersonError specializes QuantityUltimateSortal
        collective CollectiveError specializes QuantityUltimateSortal
        quantity QuantityError specializes QuantityUltimateSortal
        relator RelatorError specializes QuantityUltimateSortal
        quality QualityError specializes QuantityUltimateSortal
        mode ModeError specializes QuantityUltimateSortal
        intrinsicMode  IntrinsicModeError specializes QuantityUltimateSortal
        extrinsicMode ExtrinsicModeError specializes QuantityUltimateSortal
      }
      `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(8);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(
        ErrorMessages.ultimateSortalSpecializesUltimateSortal
      );
    });
  });

  it("should have relator UltimateSortal specialization error", async () => {
    const stub = `
      module RelatorUltimateSortalValidator {
        relator RelatorUltimateSortal
    
        kind PersonError specializes RelatorUltimateSortal
        collective CollectiveError specializes RelatorUltimateSortal
        quantity QuantityError specializes RelatorUltimateSortal
        relator RelatorError specializes RelatorUltimateSortal
        quality QualityError specializes RelatorUltimateSortal
        mode ModeError specializes RelatorUltimateSortal
        intrinsicMode  IntrinsicModeError specializes RelatorUltimateSortal
        extrinsicMode ExtrinsicModeError specializes RelatorUltimateSortal
      }
      `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(8);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(
        ErrorMessages.ultimateSortalSpecializesUltimateSortal
      );
    });
  });

  it("should have quality UltimateSortal specialization error", async () => {
    const stub = `
      module QualityUltimateSortalValidator {
        quality QualityUltimateSortal
    
        kind PersonError specializes QualityUltimateSortal
        collective CollectiveError specializes QualityUltimateSortal
        quantity QuantityError specializes QualityUltimateSortal
        relator RelatorError specializes QualityUltimateSortal
        quality QualityError specializes QualityUltimateSortal
        mode ModeError specializes QualityUltimateSortal
        intrinsicMode  IntrinsicModeError specializes QualityUltimateSortal
        extrinsicMode ExtrinsicModeError specializes QualityUltimateSortal
      }
      `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(8);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(
        ErrorMessages.ultimateSortalSpecializesUltimateSortal
      );
    });
  });

  it("should have mode UltimateSortal specialization error", async () => {
    const stub = `
      module ModeUltimateSortalValidator {
        mode ModeUltimateSortal
    
        kind PersonError specializes ModeUltimateSortal
        collective CollectiveError specializes ModeUltimateSortal
        quantity QuantityError specializes ModeUltimateSortal
        relator RelatorError specializes ModeUltimateSortal
        quality QualityError specializes ModeUltimateSortal
        mode ModeError specializes ModeUltimateSortal
        intrinsicMode  IntrinsicModeError specializes ModeUltimateSortal
        extrinsicMode ExtrinsicModeError specializes ModeUltimateSortal
    }
      `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(8);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(
        ErrorMessages.ultimateSortalSpecializesUltimateSortal
      );
    });
  });

  it("should have intrinsicMode UltimateSortal specialization error", async () => {
    const stub = `
      module IntrinsicModeUltimateSortalValidator {
        intrinsicMode IntrinsicModeUltimateSortal
    
        kind PersonError specializes IntrinsicModeUltimateSortal
        collective CollectiveError specializes IntrinsicModeUltimateSortal
        quantity QuantityError specializes IntrinsicModeUltimateSortal
        relator RelatorError specializes IntrinsicModeUltimateSortal
        quality QualityError specializes IntrinsicModeUltimateSortal
        mode ModeError specializes IntrinsicModeUltimateSortal
        intrinsicMode  IntrinsicModeError specializes IntrinsicModeUltimateSortal
        extrinsicMode ExtrinsicModeError specializes IntrinsicModeUltimateSortal
      }
      `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(8);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(
        ErrorMessages.ultimateSortalSpecializesUltimateSortal
      );
    });
  });

  it("should have extrinsicMode UltimateSortal specialization error", async () => {
    const stub = `
      module ExtrinsicModeUltimateSortalValidator {
        extrinsicMode ExtrinsicModeUltimateSortal
    
        kind PersonError specializes ExtrinsicModeUltimateSortal
        collective CollectiveError specializes ExtrinsicModeUltimateSortal
        quantity QuantityError specializes ExtrinsicModeUltimateSortal
        relator RelatorError specializes ExtrinsicModeUltimateSortal
        quality QualityError specializes ExtrinsicModeUltimateSortal
        mode ModeError specializes ExtrinsicModeUltimateSortal
        intrinsicMode  IntrinsicModeError specializes ExtrinsicModeUltimateSortal
        extrinsicMode ExtrinsicModeError specializes ExtrinsicModeUltimateSortal
      }
      `;
    const validationResult = await validate(stub);

    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).not.toBeNull();
    expect(diagnostics.length).toBe(8);

    diagnostics.forEach((error) => {
      expect(error.message).toBe(
        ErrorMessages.ultimateSortalSpecializesUltimateSortal
      );
    });
  });
});
