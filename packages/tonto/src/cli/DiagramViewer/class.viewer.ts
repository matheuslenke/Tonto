import { Class } from "ontouml-js";
import { Configuration } from "../../utils/setExtensionConfig";

export function classViewer(
    model: Class,
    config: Configuration
): string {
    let nomnomlCode = "";

    nomnomlCode += `[«${model.stereotype}» ${(model.getName("en") || "")} `;

    if(config.Entity.Attributes && model.hasAttributes()){
        nomnomlCode += `| `
        
        model.getAllAttributes().forEach((property, index) => {
            nomnomlCode += `${property.getName("en") || ""}: ${(property.propertyType.getName("en") || "")} `
            if(index !== model.getAllAttributes().length-1) nomnomlCode += '; '
        })
    }
    nomnomlCode += ']\n';
return nomnomlCode;
}