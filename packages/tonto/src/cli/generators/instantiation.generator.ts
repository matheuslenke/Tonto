import { Class, Package, Relation } from "ontouml-js";
import { ClassDeclaration, PackageDeclaration } from "../../language/index.js";
import { createInstantiation } from "./class.generator.js";

export function generateInstantiations(
    PackageDeclaration: PackageDeclaration,
    classes: Class[],
    relations: Relation[],
    packageItem: Package
): void {
    PackageDeclaration.declarations.forEach((declaration) => {
        if (declaration.$type === "ClassDeclaration") {
            const classElement = declaration as ClassDeclaration;
            const instanceOfClass = classElement.instanceOf?.ref;

            if (instanceOfClass) {
                const sourceClass = classes.find((item) => item.name.getText() === classElement.id);

                if (sourceClass) {
                    const targetClass = classes.find((item) => item.name.getText() === instanceOfClass.id);
                    if (targetClass) {
                        createInstantiation(packageItem, targetClass, sourceClass);
                    }
                }
            }
        }
    });
}
