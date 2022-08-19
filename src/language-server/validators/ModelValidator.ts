import { ElementRelation } from "./../generated/ast";
import { ValidationAcceptor } from "langium";
import { Model, ContextModule } from "../generated/ast";

export class ModelValidator {
  /*
   * Checks if for the same file it has a duplicated module name
   */
  checkDuplicatedContextModuleNames(
    model: Model,
    accept: ValidationAcceptor
  ): void {
    const modules = model.modules;

    let names: string[] = [];

    modules.forEach((module) => {
      if (module.$type === "ContextModule") {
        const item = (module as unknown) as ContextModule;
        const nameExists = names.find((name) => name === item.name);
        if (nameExists) {
          accept("error", "Duplicated Module declaration", {
            node: item,
            property: "name",
          });
        } else {
          names.push(item.name);
        }
      }
    });
  }

  /*
   * Checks for duplicate external reference names
   */
  checkDuplicatedReferenceNames(
    model: Model,
    accept: ValidationAcceptor
  ): void {
    const modules = model.modules;

    modules.forEach((module) => {
      let names: string[] = [];

      module.elements.forEach((element) => {
        if (element.$type === "ElementRelation") {
          const ElementRelation = element as ElementRelation;
          const nameExists = names.find(
            (name) => name === ElementRelation.name
          );
          const refName = ElementRelation.name;

          if (nameExists) {
            accept("error", "Duplicated Reference declaration", {
              node: ElementRelation,
              property: "name",
            });
          } else if (refName !== undefined) {
            names.push(ElementRelation.name!);
          }
        }
      });
    });
  }
}
