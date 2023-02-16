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
        validator.ClassDeclarationValidator
          .checkClassDeclarationShouldSpecializeUltimateSortal,
        validator.ClassDeclarationValidator.checkRigidSpecializesAntiRigid,
        validator.ClassDeclarationValidator.checkDuplicatedReferenceNames,
        validator.ClassDeclarationValidator.checkCompatibleNatures,
        // validator.ClassDeclarationValidator.checkCircularSpecialization,
        validator.ClassDeclarationValidator.checkNaturesOnlyOnNonSortals,
        validator.ClassDeclarationValidator.checkSpecializationOfCorrectNature,
        validator.ClassDeclarationValidator.checkClassWithoutStereotype,
        validator.ClassDeclarationValidator.checkGeneralizationSortality,
        validator.ClassDeclarationValidator.checkGeneralizationDataType,
      ],
      ContextModule: [
        // validator.ContextModuleValidator.checkContextModuleStartsWithCapital,
        validator.ContextModuleValidator.checkDuplicatedClassName,
        validator.ContextModuleValidator.checkDuplicatedRelationName,
        validator.ContextModuleValidator.checkCircularSpecialization,
      ],
      GeneralizationSet: [
        validator.GeneralizationValidator.checkCircularGeneralization,
        validator.GeneralizationValidator.checkGeneralizationSetConsistency,
        validator.GeneralizationValidator.checkGeneralizationSortality,
        validator.GeneralizationValidator.checkRigidSpecializesAntiRigid,
        validator.GeneralizationValidator.checkGeneralizationDataType,
      ],
      ComplexDataType: [
        validator.ComplexDataTypeValidator.checkCompatibleNatures
      ]
    };
    this.register(checks, validator);
  }
}
