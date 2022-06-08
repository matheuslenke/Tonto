import { ValidationAcceptor } from 'langium';
import { Element, ContextModule } from "../generated/ast";

export class ContextModuleValidator {
    checkContextModuleStartsWithCapital(contextModule: ContextModule, accept: ValidationAcceptor): void {
        if (contextModule.name) {
            const firstChar = contextModule.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Module name should start with a capital.', { node: contextModule, property: 'name' });
            }
        }
    }

    checkClassStartsWithCapital(classItem: Element, accept: ValidationAcceptor): void {
        if (classItem.name) {
            const firstChar = classItem.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Class name should start with a capital.', { node: classItem, property: 'name' });
            }
        }
    }
}