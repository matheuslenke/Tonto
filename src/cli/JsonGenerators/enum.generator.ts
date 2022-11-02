import { Package } from "ontouml-js";
import { EnumData } from "../../language-server/generated/ast";

export function enumGenerator(enumData: EnumData, model: Package) {
  const createdEnum = model.createEnumeration(enumData.name);
  enumData.elements.forEach((element) => {
    createdEnum.createLiteral(element.name);
  });
}
