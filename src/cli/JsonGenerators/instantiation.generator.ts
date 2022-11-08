import { Class, Package, Relation } from "ontouml-js";
import {
  ClassDeclaration, ContextModule
} from "../../language-server/generated/ast";
import { createInstantiation } from "./class.generator";

export function generateInstantiations(
  contextModule: ContextModule,
  classes: Class[],
  relations: Relation[],
  packageItem: Package
): void {
  contextModule.declarations.forEach((declaration) => {
    if (declaration.$type === "ClassDeclaration") {
      const classElement = declaration as ClassDeclaration;
      const instanceOfClass = classElement.instanceOf?.ref;

      if (instanceOfClass) {
        const sourceClass = classes.find(
          (item) => item.name.getText() === classElement.name
        );

        if (sourceClass) {
          const targetClass = classes.find(
            (item) => item.name.getText() === instanceOfClass.name
          );
          if (targetClass) {
            createInstantiation(packageItem, targetClass, sourceClass);
          }
        }
      }
    }
  });
}
