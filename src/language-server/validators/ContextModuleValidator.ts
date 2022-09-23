import { ValidationAcceptor } from "langium";
import { ClassElement, ContextModule, ElementRelation } from "../generated/ast";

export class ContextModuleValidator {
  checkContextModuleStartsWithCapital(
    contextModule: ContextModule,
    accept: ValidationAcceptor
  ): void {
    if (contextModule.name) {
      const firstChar = contextModule.name.substring(0, 1);
      if (firstChar.toUpperCase() !== firstChar) {
        accept("warning", "Module name should start with a capital.", {
          node: contextModule,
          property: "name",
        });
      }
    }
  }

  checkDuplicatedClassName(
    contextModule: ContextModule,
    accept: ValidationAcceptor
  ): void {
    const elements = contextModule.elements;
    const names: string[] = [];

    elements.forEach((element) => {
      if (element.$type === "ClassElement") {
        const classElement = element as ClassElement;
        const nameExists = names.find((name) => name === classElement.name);
        const refName = classElement.name;

        if (nameExists) {
          accept("error", "Duplicated class declaration", {
            node: classElement,
            property: "name",
          });
        } else if (refName !== undefined) {
          names.push(classElement.name!);
        }
      }
    });
  }

  checkDuplicatedRelationName(
    contextModule: ContextModule,
    accept: ValidationAcceptor
  ): void {
    let names: string[] = [];

    contextModule.elements.forEach((element) => {
      if (element.$type === "ElementRelation") {
        const elementRelation = element as ElementRelation;
        const nameExists = names.find((name) => name === elementRelation.name);
        const refName = elementRelation.name;

        if (nameExists) {
          console.log("Duplicado!", elementRelation.name);
          accept("error", "Duplicated Reference declaration", {
            node: elementRelation,
            property: "name",
          });
        } else if (refName !== undefined) {
          names.push(elementRelation.name!);
        }
      }
    });
  }
}
