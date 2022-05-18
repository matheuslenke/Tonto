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
            ElementReference: [validator.ClassElementValidator.checksExternalReference],
            ClassElement: [validator.ClassElementValidator.checkKindSpecialization]
            // EndurantInternalReference: validator.checksExternalReference
            // Person: validator.checkPersonStartsWithCapital
        };
        this.register(checks, validator);
    }
}

/**
 * Implementation of custom validations.
 */
