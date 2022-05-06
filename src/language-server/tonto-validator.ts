import { EndurantValidator } from './validators/EndurantValidator';
import { ValidationCheck, ValidationRegistry } from 'langium';
import { tontoAstType } from './generated/ast';
import { TontoServices } from './tonto-module';
import { PackageValidator } from './validators/ContextModuleValidator';

/**
 * Map AST node types to validation checks.
 */
type TontoChecks = { [type in tontoAstType]?: ValidationCheck | ValidationCheck[] }

/**
 * Registry for validation checks.
 */
export class TontoValidationRegistry extends ValidationRegistry {
    constructor(services: TontoServices) {
        super(services);
        const validator = services.validation.TontoValidator;
        const checks: TontoChecks = {
            ContextModule: [
                validator.contextModuleValidator.checkIfModelIsValid, 
                validator.contextModuleValidator.checkContextModuleStartsWithCapital ],
            Endurant: [validator.endurantValidator.checkEndurantIsValid]
        };
        this.register(checks, validator);
    }
}

/**
 * Implementation of custom validations.
 */
export class TontoValidator {

    contextModuleValidator = new PackageValidator();
    endurantValidator = new EndurantValidator();
}
