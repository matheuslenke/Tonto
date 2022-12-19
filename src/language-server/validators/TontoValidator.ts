import { ClassElementValidator } from "./ClassElementValidator";
import { ContextModuleValidator } from "./ContextModuleValidator";
import { ModelValidator } from "./ModelValidator";

export class TontoValidator {
    ContextModuleValidator = new ContextModuleValidator();
    ClassElementValidator = new ClassElementValidator();
    ModelValidator = new ModelValidator();
}
