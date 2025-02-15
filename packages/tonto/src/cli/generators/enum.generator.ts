import { Class, Package } from "ontouml-js";
import { DataType } from "../../language/index.js";

export function enumGenerator(enumData: DataType, model: Package): Class {
    const createdEnum = model.createEnumeration(enumData.name);
    enumData.elements.forEach((element) => {
        createdEnum.createLiteral(element.name);
    });
    return createdEnum;
}
