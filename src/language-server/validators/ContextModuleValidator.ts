import { ValidationAcceptor } from 'langium';
import { Class, Model, ContextModule } from "../generated/ast";

export class PackageValidator {
    checkContextModuleStartsWithCapital(packageItem: ContextModule, accept: ValidationAcceptor): void {
        if (packageItem.name) {
            const firstChar = packageItem.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Module name should start with a capital.', { node: packageItem, property: 'name' });
            }
        }
    }

    checkClassStartsWithCapital(classItem: Class, accept: ValidationAcceptor): void {
        if (classItem.name) {
            const firstChar = classItem.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Class name should start with a capital.', { node: classItem, property: 'name' });
            }
        }
    }

    checkDuplicatedContextModuleNames(model: Model, accept: ValidationAcceptor): void {
        const elements = model.elements;

        let names: string[] = []

        elements.forEach(element => {
            if (element.$type === 'ContextModule') {
                const item = element as unknown as ContextModule
                const nameExists = names.find( name => name === item.name)
                if (nameExists) {
                    accept("error", "Duplicated Module declaration", { node: item , property: 'name'})
                } else {
                    names.push(item.name);
                }
            }
        })
    }

    checkIfModelIsValid(packageItem: ContextModule, accept: ValidationAcceptor): void {
    }


}