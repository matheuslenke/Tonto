import { ValidationChecks, ValidationRegistry } from 'langium';
import { TontoAstType } from './generated/ast';
import type { TontoServices } from './tonto-module';

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
                validator.ClassElementValidator.checkSortalSpecializeUniqueUltimateSortal,
                validator.ClassElementValidator.checkUltimateSortalSpecializeUltimateSortal,
                validator.ClassElementValidator.checkClassDeclarationShouldSpecializeUltimateSortal,
                validator.ClassElementValidator.checkRigidSpecializesAntiRigid,
                validator.ClassElementValidator.checkDuplicatedReferenceNames,
                validator.ClassElementValidator.checkCompatibleNatures,
                validator.ClassElementValidator.checkCircularSpecialization,
                validator.ClassElementValidator.checkNaturesOnlyOnNonSortals,
                validator.ClassElementValidator.checkSpecializationOfCorrectNature,
                validator.ClassElementValidator.checkClassWithoutStereotype,
                validator.ClassElementValidator.checkGeneralizationSortality,
                validator.ClassElementValidator.checkGeneralizationDataType
            ],
            ContextModule: [
            // validator.ContextModuleValidator.checkContextModuleStartsWithCapital,
                validator.ContextModuleValidator.checkDuplicatedClassName,
                validator.ContextModuleValidator.checkDuplicatedRelationName
            ],
            GeneralizationSet: [
                validator.GeneralizationValidator.checkCircularGeneralization,
                validator.GeneralizationValidator.checkGeneralizationSetConsistency,
                validator.GeneralizationValidator.checkGeneralizationSortality,
                validator.GeneralizationValidator.checkRigidSpecializesAntiRigid,
                validator.GeneralizationValidator.checkGeneralizationDataType
            ]
        };
        this.register(checks, validator);
    }
}
