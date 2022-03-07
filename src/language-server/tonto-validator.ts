import { ValidationCheck, ValidationRegistry } from 'langium';
import { TontoAstType } from './generated/ast';
import { TontoServices } from './tonto-module';

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
        const checks: TontoChecks = {};
        this.register(checks, validator);
    }
}

/**
 * Implementation of custom validations.
 */
export class TontoValidator {

    // checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
    //     if (person.name) {
    //         const firstChar = person.name.substring(0, 1);
    //         if (firstChar.toUpperCase() !== firstChar) {
    //             accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
    //         }
    //     }
    // }
}
