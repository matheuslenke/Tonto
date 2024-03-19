import { ClassDeclarationValidator } from "./ClassDeclarationValidator.js";
import { ComplexDataTypeValidator } from "./ComplexDataTypeValidator.js";
import { ContextModuleValidator } from "./ContextModuleValidator.js";
import { GeneralizationValidator } from "./GeneralizationValidator.js";
import { ModelValidator } from "./ModelValidator.js";

export class TontoValidator {
  ContextModuleValidator = new ContextModuleValidator();
  ClassDeclarationValidator = new ClassDeclarationValidator();
  ModelValidator = new ModelValidator();
  GeneralizationValidator = new GeneralizationValidator();
  ComplexDataTypeValidator = new ComplexDataTypeValidator();
}
