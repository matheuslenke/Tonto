import { CompositeGeneratorNode, NL } from "langium/generate";
import { AggregationKind, Class, Generalization, OntoumlElement, OntoumlType, Property, Relation } from "ontouml-js";
import { notEmpty } from "../../utils/isEmpty.js";
import { formatForId } from "../utils/replaceWhitespace.js";
import { constructCardinality } from "./cardinality.constructor.js";

export function constructInternalRelations(element: Class, relations: Relation[], fileNode: CompositeGeneratorNode) {
    relations
        .filter((item) => item.isBinary() === true)
        .forEach((relation) => {
            constructRelation(relation, fileNode, { external: false, sourceClass: element });
        });
}

export function constructExternalRelations(relations: Relation[], fileNode: CompositeGeneratorNode) {
    relations
        .filter((item) => item.isBinary() === true)
        .forEach((relation) => {
            constructRelation(relation, fileNode, { external: true });
        });
}

function constructRelation(
    relation: Relation,
    fileNode: CompositeGeneratorNode,
    options: { external: boolean; sourceClass?: Class }
) {
    const sourceElement = options.sourceClass ?? relation.getSource();
    const sourceProperty = relation.getSourceEnd();
    const targetClass = relation.getTarget();
    const targetProperty = relation.getTargetEnd();
    const generalizations = relation.getGeneralizationsWhereSpecific();
    const currentPackageName = getContainingPackageName(relation);

    const sourceClassPackage = getContainingPackage(sourceElement);
    const sourceName = sourceClassPackage?.getName();
    const targetClassPackage = getContainingPackage(targetClass);
    const targetName = targetClassPackage?.getName();

    if (relation.stereotype) {
        fileNode.append(`@${formatForId(relation.stereotype)}`, NL);
    }

    if (options.external && sourceElement) {
        fileNode.append(`relation ${formatElementReference(sourceElement, currentPackageName)} `);
    }

    const firstEndName = formatForId(sourceProperty.getName());
    constructEndMetaAttributes(firstEndName, sourceProperty, currentPackageName, fileNode);
    constructCardinality(sourceProperty.cardinality, fileNode);

    const relationName = formatForId(relation.getName());

    if (sourceProperty.aggregationKind === AggregationKind.SHARED) {
        fileNode.append("<>-- ");
        if (relationName) {
            fileNode.append(`${relationName}`);
            fileNode.append(" -- ");
        }
    } else if (sourceProperty.aggregationKind === AggregationKind.COMPOSITE) {
        fileNode.append("<o>-- ");
        if (relationName) {
            fileNode.append(`${relationName}`);
            fileNode.append(" -- ");
        }
    } else if (sourceProperty.aggregationKind === AggregationKind.NONE) {
        if (targetProperty.isComposite()) {
            if (relationName) {
                fileNode.append(" -- ");
                fileNode.append(`${relationName}`);
            }
            fileNode.append(" --<o> ");
        } else if (targetProperty.isAggregationEnd()) {
            if (relationName) {
                fileNode.append(" -- ");
                fileNode.append(`${relationName}`);
            }
            fileNode.append(" --<> ");
        } else {
            fileNode.append("-- ");
            if (relationName) {
                fileNode.append(`${relationName}`);
                fileNode.append(" -- ");
            }
        }
    }

    constructCardinality(targetProperty.cardinality, fileNode);

    const secondEndName = formatForId(targetProperty.getName());
    let targetClassName = targetClass.getName();
    if (targetName && sourceName && targetName !== sourceName) {
        targetClassName = `${targetClassPackage?.getName()}.${targetClass.getName()}`;
    }

    fileNode.append(" ", formatForId(targetClassName));
    constructEndMetaAttributes(secondEndName, targetProperty, currentPackageName, fileNode);

    constructRelationSpecializations(generalizations, currentPackageName, fileNode);
    fileNode.append(NL);
}

function constructEndMetaAttributes(
    endName: string | undefined,
    property: Property,
    currentPackageName: string | undefined,
    fileNode: CompositeGeneratorNode
) {
    const subsettedProperties = property.subsettedProperties
        .map((subsettedProperty) => resolvePropertyReference(property, subsettedProperty))
        .map((subsettedProperty) => formatEndOverrideReference("subsets", subsettedProperty, currentPackageName))
        .filter(notEmpty);
    const redefinedProperties = property.redefinedProperties
        .map((redefinedProperty) => resolvePropertyReference(property, redefinedProperty))
        .map((redefinedProperty) => formatEndOverrideReference("redefines", redefinedProperty, currentPackageName))
        .filter(notEmpty);

    const metaAttributes = [
        property.isDerived ? "derived" : null,
        property.isOrdered ? "ordered" : null,
        property.isReadOnly ? "const" : null,
        ...subsettedProperties,
        ...redefinedProperties,
    ].filter(notEmpty);

    if (metaAttributes.length === 0) {
        return;
    }

    fileNode.append("( {");
    metaAttributes.forEach((metaAttribute, index) => {
        fileNode.append(metaAttribute);
        if (index < metaAttributes.length - 1) {
            fileNode.append(", ");
        }
    });
    fileNode.append(" }");
    if (endName) {
        fileNode.append(` ${endName}`);
    }
    fileNode.append(" )");
}

function constructRelationSpecializations(
    generalizations: Generalization[],
    currentPackageName: string | undefined,
    fileNode: CompositeGeneratorNode
) {
    if (generalizations.length === 0) {
        return;
    }

    fileNode.append(" specializes ");
    generalizations.forEach((generalization, index) => {
        if (generalization.involvesRelations()) {
            const relationReference = formatRelationReference(generalization.getGeneralRelation(), currentPackageName);
            if (relationReference) {
                fileNode.append(relationReference);
            }
        }

        if (index < generalizations.length - 1) {
            fileNode.append(", ");
        }
    });
}

function resolvePropertyReference(contextProperty: Property, referencedProperty: Property): Property {
    if (referencedProperty.container) {
        return referencedProperty;
    }

    const rootPackage = contextProperty.getModelOrRootPackage();
    const resolvedProperty = rootPackage
        .getAllContents()
        .find((item) => item.type === OntoumlType.PROPERTY_TYPE && item.id === referencedProperty.id);

    return resolvedProperty instanceof Property ? resolvedProperty : referencedProperty;
}

function formatEndOverrideReference(
    keyword: "subsets" | "redefines",
    property: Property,
    currentPackageName: string | undefined
): string | null {
    const propertyName = property.getName();
    if (!propertyName) {
        return null;
    }

    const relation = property.container;
    if (!(relation instanceof Relation)) {
        return null;
    }

    const relationReference = formatRelationReference(relation, currentPackageName);
    if (!relationReference) {
        return null;
    }

    return `${keyword} ${relationReference}.${formatForId(propertyName)}`;
}

function formatRelationReference(relation: Relation, currentPackageName: string | undefined): string | undefined {
    const relationName = relation.getName();
    if (!relationName) {
        return undefined;
    }

    const sourceReference = formatElementReference(relation.getSource(), currentPackageName);
    return sourceReference ? `${sourceReference}.${formatForId(relationName)}` : formatForId(relationName);
}

function formatElementReference(
    element: OntoumlElement | { getName?: () => string | null },
    currentPackageName: string | undefined
): string {
    const elementName = element.getName?.();
    if (!elementName) {
        return "";
    }

    const ownerPackageName = element instanceof OntoumlElement ? getContainingPackageName(element) : undefined;
    const formattedName = formatForId(elementName);

    if (ownerPackageName && currentPackageName && ownerPackageName !== currentPackageName) {
        return `${formatForId(ownerPackageName)}.${formattedName}`;
    }

    return formattedName;
}

function getContainingPackage(element: OntoumlElement | undefined): OntoumlElement | undefined {
    let current = element?.container;

    while (current && current.type !== OntoumlType.PACKAGE_TYPE) {
        current = current.container;
    }

    return current;
}

function getContainingPackageName(element: OntoumlElement | undefined): string | undefined {
    const containerPackage = getContainingPackage(element);
    return containerPackage?.getName?.();
}
