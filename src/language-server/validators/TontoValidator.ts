import { ClassElementValidator } from "./ClassElementValidator";
import { ContextModuleValidator } from "./ContextModuleValidator";
import { GeneralizationValidator } from "./GeneralizationValidator";
import { ModelValidator } from "./ModelValidator";

export class TontoValidator {
  ContextModuleValidator = new ContextModuleValidator();
  ClassElementValidator = new ClassElementValidator();
  ModelValidator = new ModelValidator();
  GeneralizationValidator = new GeneralizationValidator();
}
