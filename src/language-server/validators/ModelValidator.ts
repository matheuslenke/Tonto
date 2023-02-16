import { ValidationAcceptor } from "langium";
import { ContextModule, Model } from "../generated/ast";

export class ModelValidator {
  /*
   * Checks if for the same file it has a duplicated module name
   */
  checkDuplicatedContextModuleNames(
    model: Model,
    accept: ValidationAcceptor
  ): void {
    const modules = model.modules;
    const names: string[] = [];

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
}
