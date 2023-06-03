import { ValidationChecks, ValidationRegistry } from "langium";
import { TontoAstType } from "./generated/ast";
import type { TontoServices } from "./tonto-module";

/**
 * Registry for validation checks.
 */
export class TontoValidationRegistry extends ValidationRegistry {
  constructor(services: TontoServices) {
    super(services);
    const validator = services.validation.TontoValidator;
    const checks: ValidationChecks<TontoAstType> = {
      Model: [
        // validator.ModelValidator.checkDuplicatedContextModuleNames,
      ],
      ClassDeclaration: [
        validator.ClassDeclarationValidator
          .checkUltimateSortalSpecializeUltimateSortal,
        // validator.ClassDeclarationValidator
        //   .checkClassDeclarationShouldSpecializeUltimateSortal,
        validator.ClassDeclarationValidator.checkRigidSpecializesAntiRigid,
        validator.ClassDeclarationValidator.checkDuplicatedReferenceNames,
        validator.ClassDeclarationValidator.checkCompatibleNatures,
        validator.ClassDeclarationValidator.checkNaturesOnlyOnNonSortals,
        validator.ClassDeclarationValidator.checkClassWithoutStereotype,
        validator.ClassDeclarationValidator.checkGeneralizationSortality,
        validator.ClassDeclarationValidator.checkGeneralizationDataType,
        validator.ClassDeclarationValidator.checkSpecializationNatureRestrictions,
        validator.ClassDeclarationValidator.checkClassDeclarationShouldSpecializeUltimateSortal
      ],
      ContextModule: [
        validator.ContextModuleValidator.checkDuplicatedClassName,
        validator.ContextModuleValidator.checkDuplicatedRelationName,
        validator.ContextModuleValidator.checkCircularSpecialization,
        validator.ContextModuleValidator.checkClassDeclarationShouldSpecializeUltimateSortal,
      ],
      GeneralizationSet: [
        validator.GeneralizationValidator.checkCircularGeneralization,
        validator.GeneralizationValidator.checkGeneralizationSetConsistency,
        validator.GeneralizationValidator.checkGeneralizationSortality,
        validator.GeneralizationValidator.checkRigidSpecializesAntiRigid,
        validator.GeneralizationValidator.checkGeneralizationDataType,
      ],
      DataType: [
        validator.ComplexDataTypeValidator.checkCompatibleNatures,
        validator.ComplexDataTypeValidator.checkSpecialization
      ],
    };
    this.register(checks, validator);
  }
}
