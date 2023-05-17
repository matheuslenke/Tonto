import { CompositeGeneratorNode, NL } from "langium";
import { Class, Generalization, OntoumlElement, OntoumlType, Package, Property, Relation } from "ontouml-js";
import { formatForId } from "../utils/replaceWhitespace";

export function createTontoImports(
  actualPackage: Package,
  fileNode: CompositeGeneratorNode
) {
  // Getting containers from relations
  const relationContainers: Package[] = getContainersFromRelations(actualPackage);

  // Getting containers from specializations
  const generalizationContainers: Package[] = getContainersFromSpecializations(actualPackage);

  const uniqueContainers = new Set([...relationContainers, ...generalizationContainers]);
  const externalPackages: OntoumlElement[] = [];

  uniqueContainers.forEach(container => {
    if (container.id !== actualPackage.id) {
      externalPackages.push(container);
    }
  });

  externalPackages.forEach(externalPackage => {
    fileNode.append(`import ${formatForId(externalPackage.getNameOrId())}`, NL);
  });
  if (externalPackages.length > 0) {
    fileNode.appendNewLine();
  }
}

function getContainersFromRelations(actualPackage: Package): Package[] {
  const relationContainers: Package[] = actualPackage.getContents()
    .filter((item: OntoumlElement) => item.type === OntoumlType.RELATION_TYPE)
    .map((item: OntoumlElement) => item as Relation)
    .flatMap((item: Relation) => item.properties as Property[])
    .filter((item: Property) => item !== undefined)
    .flatMap((property: Property) => {
      return property.propertyType;
    })
    .map((item: OntoumlElement) => item.container as Package);
  return relationContainers;
}

function getContainersFromSpecializations(actualPackage: Package): Package[] {
  const generalizationContainers: Package[] = actualPackage.getContents()
    .filter((item: OntoumlElement) => item.type === OntoumlType.CLASS_TYPE)
    .map((item: OntoumlElement) => item as Class)
    .flatMap(item => item.getGeneralizationsWhereSpecific())
    .flatMap((item: Generalization) => [item.general, item.specific])
    .map(item => {
      // if (actualPackage.getName() === "Class")
      // console.log(`${item.getName()} : ${actualPackage.getName()}`);
      return item;
    })
    .flatMap(item => item.container as Package)
    .filter((item: Package) => item !== undefined);
  return generalizationContainers;
}
