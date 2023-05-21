import { Class, GeneralizationSet, Package } from "ontouml-js";
import { GeneralizationSet as GenSetData } from "../../language-server/generated/ast";

export function generalizationSetGenerator(
  enumData: GenSetData,
  classes: Class[],
  model: Package
): GeneralizationSet | undefined {
  const generalItem = classes.find(
    (item) => item.name.getText() === enumData.generalItem?.ref?.name
  );

  const specifics: Class[] = enumData.specificItems
    .map((specificElement) => {
      const specificItem = classes.find(
        (item) => item.name.getText() === specificElement.ref?.name
      );
      if (specificItem) {
        return specificItem;
      }
      return undefined;
    })
    .filter((item) => item !== undefined) as Class[];

  if (generalItem) {
    return model.createGeneralizationSetFromClasses(
      generalItem,
      specifics,
      enumData.disjoint,
      enumData.complete,
      enumData.name
    );
  }
  return undefined;
}
