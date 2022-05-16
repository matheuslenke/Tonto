import { ClassElementValidator } from "./ClassElementValidator";
import { ContextModuleValidator } from "./ContextModuleValidator";

export class TontoValidator {
  ContextModuleValidator = new ContextModuleValidator();
  ClassElementValidator = new ClassElementValidator();
}