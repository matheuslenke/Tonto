import { ValidationAcceptor } from 'langium';
import { ContextModule } from "../generated/ast";

export class ContextModuleValidator {
    checkContextModuleStartsWithCapital(contextModule: ContextModule, accept: ValidationAcceptor): void {
        if (contextModule.name) {
            const firstChar = contextModule.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Module name should start with a capital.', { node: contextModule, property: 'name' });
            }
        }
    }
}