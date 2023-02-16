import { Package } from "ontouml-js";
import { Enum } from "../../language-server/generated/ast";

export function enumGenerator(enumData: Enum, model: Package) {
  const createdEnum = model.createEnumeration(enumData.name);
  enumData.elements.forEach((element) => {
    createdEnum.createLiteral(element.name);
  });
}
