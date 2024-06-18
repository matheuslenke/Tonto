import { ClassDeclarationValidator } from "./ClassDeclarationValidator.js";
import { ComplexDataTypeValidator } from "./ComplexDataTypeValidator.js";
import { GeneralizationValidator } from "./GeneralizationValidator.js";
import { ModelValidator } from "./ModelValidator.js";
import { PackageDeclarationValidator } from "./PackageDeclarationValidator.js";

export class TontoValidator {
    PackageDeclarationValidator = new PackageDeclarationValidator();
    ClassDeclarationValidator = new ClassDeclarationValidator();
    ModelValidator = new ModelValidator();
    GeneralizationValidator = new GeneralizationValidator();
    ComplexDataTypeValidator = new ComplexDataTypeValidator();
}
