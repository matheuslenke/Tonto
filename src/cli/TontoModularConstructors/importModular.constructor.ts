import { CompositeGeneratorNode, NL } from "langium";
import { OntoumlElement, OntoumlType, Package, Property } from "ontouml-js";

export function createTontoImports(
  actualPackage: Package,
  fileNode: CompositeGeneratorNode
) {
  const containers = actualPackage.getAllRelationEnds().flatMap((relationEnd: Property) => {
    if (relationEnd.propertyType.type === OntoumlType.CLASS_TYPE) {
      const parents = relationEnd.propertyType.getParents().map(e => e.container);
      return parents;
    }
    return undefined;
  }).filter(item => item !== undefined || item !== null);

  const uniqueContainers = new Set(containers);
  const externalPackages: OntoumlElement[] = [];

  uniqueContainers.forEach(container => {
    if (container.id !== actualPackage.id) {
      externalPackages.push(container);
    }
  });

  externalPackages.forEach(externalPackage => {
    fileNode.append(`import ${externalPackage.getNameOrId()}`, NL);
  });
}
