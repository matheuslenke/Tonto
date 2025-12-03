import { Class, Package } from "ontouml-js";
import { DataType } from "../../language/index.js";

import { getDescription, getMultilingualText } from "./utils/labelUtils.js";

export function enumGenerator(enumData: DataType, model: Package): Class {
    const name = getMultilingualText(enumData.label, enumData.name);
    const description = getDescription(enumData.description);
    
    const createdEnum = model.createEnumeration(name.getText());
    if (description) {
        createdEnum.description = description;
    }
    
    enumData.elements.forEach((element) => {
        createdEnum.createLiteral(element.name);
    });
    createdEnum.name = name;

    createdEnum.id = enumData.name;

    return createdEnum;
}
