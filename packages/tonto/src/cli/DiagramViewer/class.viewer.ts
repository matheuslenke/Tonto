import { Class } from "ontouml-js";
import { Configuration } from "../../utils/extensionConfig";

export function classViewer(
    model: Class,
    config: Configuration
): string {
    let nomnomlCode = "";

    nomnomlCode += `[«${model.stereotype}» ${(model.getName("en") || "")} `;

    if(config.Entity.Attributes && model.hasAttributes()){
        nomnomlCode += `| `
        
        model.getOwnAttributes().forEach((property, index) => {
            nomnomlCode += `${property.getName("en") || ""}: ${(property.propertyType.getName("en") || "")}; `
        })
    }
    if(model.hasLiterals()){
        nomnomlCode += `| `
        
        model.getOwnLiterals().forEach((literal) => {
            nomnomlCode += `${literal.getName("en") || ""}; `
        })
    }
    nomnomlCode += ']\n';
return nomnomlCode;
}