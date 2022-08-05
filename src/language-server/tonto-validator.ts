import { ValidationCheck, ValidationRegistry } from 'langium';
import { TontoAstType } from './generated/ast';
import type { TontoServices } from './tonto-module';

/**
 * Map AST node types to validation checks.
 */
type TontoChecks = { [type in TontoAstType]?: ValidationCheck | ValidationCheck[] }

/**
 * Registry for validation checks.
 */
export class TontoValidationRegistry extends ValidationRegistry {
    constructor(services: TontoServices) {
        super(services);
        const validator = services.validation.TontoValidator;
        const checks: TontoChecks = {
            Model: [
                validator.ModelValidator.checkDuplicatedContextModuleNames,
                validator.ModelValidator.checkDuplicatedReferenceNames,
            ],
            ClassElement: [
                validator.ClassElementValidator.checkKindSpecialization,
                validator.ClassElementValidator.checkRigidSpecializesAntiRigid,
                validator.ClassElementValidator.checkDuplicatedReferenceNames,
                validator.ClassElementValidator.checkCompatibleNatures,
                validator.ClassElementValidator.checkCircularSpecialization,
                validator.ClassElementValidator.checkNaturesOnlyOnNonSortals
            ]
        };
        this.register(checks, validator);
    }
}