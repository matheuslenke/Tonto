import { ValidationChecks, ValidationRegistry } from "langium";
import { TontoAstType } from "./generated/ast.js";
import type { TontoServices } from "./tonto-module.js";

/**
 * Registry for validation checks.
 */
export class TontoValidationRegistry extends ValidationRegistry {
    constructor(services: TontoServices) {
        super(services);
        const validator = services.validation.TontoValidator;
        const checks: ValidationChecks<TontoAstType> = {
            ClassDeclaration: [
                // validator.ClassDeclarationValidator.checkUltimateSortalSpecializeUltimateSortal,
                // validator.ClassDeclarationValidator.checkRigidSpecializesAntiRigid,
                // validator.ClassDeclarationValidator.checkDuplicatedReferenceNames,
                // validator.ClassDeclarationValidator.checkCompatibleNatures,
                // validator.ClassDeclarationValidator.checkClassWithoutStereotype,
                // validator.ClassDeclarationValidator.checkGeneralizationSortality,
            ],
            PackageDeclaration: [
                // validator.PackageDeclarationValidator.checkDuplicatedClassName,
                // validator.PackageDeclarationValidator.checkCircularSpecialization,
                // validator.PackageDeclarationValidator.checkClassDeclarationShouldSpecializeUltimateSortal,
                // validator.PackageDeclarationValidator.checkCompatibleNaturesOfBaseSortals,
                // validator.PackageDeclarationValidator.checkSpecializationNatureRestrictions,
                // validator.PackageDeclarationValidator.checkRedundantNatures,
            ],
            GeneralizationSet: [
                // validator.GeneralizationValidator.checkCircularGeneralization,
                // validator.GeneralizationValidator.checkGeneralizationSetConsistency,
                // validator.GeneralizationValidator.checkGeneralizationSortality,
                // validator.GeneralizationValidator.checkRigidSpecializesAntiRigid,
                // validator.GeneralizationValidator.checkGeneralizationDataType,
            ],
            DataType: [
                // validator.ComplexDataTypeValidator.checkCompatibleNatures,
                // validator.ComplexDataTypeValidator.checkSpecialization,
            ],
        };
        this.register(checks, validator);
    }
}
