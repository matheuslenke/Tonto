import { ClassDeclarationValidator } from "./ClassDeclarationValidator";
import { ComplexDataTypeValidator } from "./ComplexDataTypeValidator";
import { ContextModuleValidator } from "./ContextModuleValidator";
import { GeneralizationValidator } from "./GeneralizationValidator";
import { ModelValidator } from "./ModelValidator";

export class TontoValidator {
  ContextModuleValidator = new ContextModuleValidator();
  ClassDeclarationValidator = new ClassDeclarationValidator();
  ModelValidator = new ModelValidator();
  GeneralizationValidator = new GeneralizationValidator();
  ComplexDataTypeValidator = new ComplexDataTypeValidator();
}
