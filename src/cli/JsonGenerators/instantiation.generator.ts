import {
  ContextModule,
  ClassElement,
} from "../../language-server/generated/ast";
import { Package, Class, Relation } from "ontouml-js";
import { createInstantiation } from "./class.generator";

export function generateInstantiations(
  contextModule: ContextModule,
  classes: Class[],
  relations: Relation[],
  packageItem: Package
): void {
  contextModule.elements.forEach((element) => {
    if (element.$type === "ClassElement") {
      const classElement = element as ClassElement;
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
