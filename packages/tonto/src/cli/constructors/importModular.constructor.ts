
import { CompositeGeneratorNode, NL } from "langium/generate";
import { Class, Generalization, OntoumlElement, OntoumlType, Package, Property, Relation, RelationStereotype } from "ontouml-js";
import { getTontoSourceImports } from "../utils/tontoMetadata.js";
import { formatTontoQualifiedName, isBuiltInTontoPackage } from "./renderUtils.js";

export function createTontoImports(actualPackage: Package, fileNode: CompositeGeneratorNode) {
    const renderedImports: string[] = [];
    const importedPackageNames = new Set<string>();

    getTontoSourceImports(actualPackage).forEach((importText) => {
        const normalizedImportText = importText.trim();
        if (!normalizedImportText) {
            return;
        }

        renderedImports.push(normalizedImportText);
        importedPackageNames.add(normalizedImportText.split(/\s+as\s+/i)[0] ?? normalizedImportText);
    });

    // Getting containers from relations
    const relationContainers: Package[] = getContainersFromRelations(actualPackage);

    // Getting containers from attributes
    const attributeContainers: Package[] = getContainersFromAttributes(actualPackage);

    // Getting containers from specializations
    const generalizationContainers: Package[] = getContainersFromSpecializations(actualPackage);

    // Getting containers from instantiations
    const instantiationContainers: Package[] = getContainersFromInstantiations(actualPackage);

    // Getting containers from relation specializations
    const relationSpecializationContainers: Package[] = getContainersFromRelationSpecializations(actualPackage);

    // Getting containers from relation-end subsets and redefinitions
    const relationEndOverrideContainers: Package[] = getContainersFromRelationEndOverrides(actualPackage);

    const uniqueContainers = new Set([
        ...relationContainers,
        ...attributeContainers,
        ...generalizationContainers,
        ...instantiationContainers,
        ...relationSpecializationContainers,
        ...relationEndOverrideContainers,
    ]);
    const externalPackages: OntoumlElement[] = [];

    Array.from(uniqueContainers.values()).forEach((container) => {
        if (container.id !== actualPackage.id) {
            externalPackages.push(container);
        }
    });

    externalPackages.forEach((externalPackage) => {
        const packageName = externalPackage.getNameOrId();
        if (!packageName || importedPackageNames.has(packageName) || isBuiltInTontoPackage(packageName)) {
            return;
        }

        renderedImports.push(formatTontoQualifiedName(packageName));
        importedPackageNames.add(packageName);
    });

    renderedImports.forEach((importText) => {
        fileNode.append(`import ${importText}`, NL);
    });
    if (renderedImports.length > 0) {
        fileNode.appendNewLine();
    }
}

function getContainersFromAttributes(actualPackage: Package): Package[] {
    return actualPackage
        .getContents()
        .filter((item: OntoumlElement) => item.type === OntoumlType.CLASS_TYPE)
        .map((item: OntoumlElement) => item as Class)
        .filter((item: Class) => !item.hasEnumerationStereotype())
        .flatMap((item: Class) => item.getOwnAttributes())
        .flatMap((attribute: Property) => attribute.propertyType ? [attribute.propertyType] : [])
        .map((item: OntoumlElement) => item.container as Package);
}

function getContainersFromRelations(actualPackage: Package): Package[] {
    const relationContainers = actualPackage
        .getContents()
        .filter((item: OntoumlElement) => item.type === OntoumlType.RELATION_TYPE)
        .map((item: OntoumlElement) => item as Relation)
        .flatMap((item: Relation) => item.properties as Property[])
        .filter((item: Property) => !!item)
        .flatMap((property: Property) => property.propertyType)
        .filter((item) => !!item)
        .map((item: OntoumlElement) => item.container as Package);
    return relationContainers;
}

function getContainersFromSpecializations(actualPackage: Package): Package[] {
    const generalizationContainers: Package[] = actualPackage
        .getContents()
        .filter((item: OntoumlElement) => item.type === OntoumlType.CLASS_TYPE)
        .map((item: OntoumlElement) => item as Class)
        .flatMap((item) => item.getGeneralizationsWhereSpecific())
        .flatMap((item: Generalization) => [item.general, item.specific])
        .filter((item) => !!item)
        .flatMap((item) => item.container as Package)
        .filter((item: Package) => !!item);

    return generalizationContainers;
}

function getContainersFromInstantiations(actualPackage: Package): Package[] {
    return actualPackage
        .getContents()
        .filter((item: OntoumlElement) => item.type === OntoumlType.CLASS_TYPE)
        .map((item: OntoumlElement) => item as Class)
        .flatMap((item: Class) => item.getOwnIncomingRelations())
        .filter((relation) => relation.stereotype === RelationStereotype.INSTANTIATION)
        .map((relation) => relation.getSourceClass().container)
        .filter((item): item is Package => item instanceof Package);
}

function getContainersFromRelationSpecializations(actualPackage: Package): Package[] {
    const generalizationContainers = actualPackage
        .getContents()
        .filter((item: OntoumlElement) => item.type === OntoumlType.GENERALIZATION_TYPE)
        .map((item) => item as Generalization)
        .filter(
            (item: Generalization) =>
                item.general.type === OntoumlType.RELATION_TYPE && item.specific.type === OntoumlType.RELATION_TYPE
        )
        .flatMap((item: Generalization) => [item.general, item.specific])
        .filter((item) => item !== undefined || item !== null)
        .flatMap((item) => item.container as Package)
        .filter((item: Package) => item !== undefined || item !== null);
    return generalizationContainers;
}

function getContainersFromRelationEndOverrides(actualPackage: Package): Package[] {
    return actualPackage
        .getContents()
        .filter((item: OntoumlElement) => item.type === OntoumlType.RELATION_TYPE)
        .map((item: OntoumlElement) => item as Relation)
        .flatMap((relation: Relation) => relation.properties as Property[])
        .flatMap((property: Property) => [...property.subsettedProperties, ...property.redefinedProperties])
        .map((property: Property) => resolvePropertyReference(actualPackage, property))
        .flatMap((property: Property) => {
            const container = property.container;
            if (container instanceof Relation) {
                return container.container;
            }
            return [];
        })
        .filter((item): item is Package => item instanceof Package);
}

function resolvePropertyReference(actualPackage: Package, referencedProperty: Property): Property {
    if (referencedProperty.container) {
        return referencedProperty;
    }

    const resolvedProperty = actualPackage
        .getModelOrRootPackage()
        .getAllContents()
        .find((item) => item.type === OntoumlType.PROPERTY_TYPE && item.id === referencedProperty.id);

    return resolvedProperty instanceof Property ? resolvedProperty : referencedProperty;
}
