import { CompositeGeneratorNode, NL } from "langium/generate";
import { AggregationKind, Class, Generalization, OntoumlType, Property, Relation } from "ontouml-js";
import { notEmpty } from "../../utils/isEmpty.js";
import { constructCardinality } from "./cardinality.constructor.js";
import {
    formatElementReference,
    formatTontoIdentifier,
    getContainingPackageName,
} from "./renderUtils.js";

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

    if (relation.stereotype) {
        fileNode.append(`@${formatTontoIdentifier(relation.stereotype)}`, NL);
    }

    if (options.external && sourceElement) {
        fileNode.append(`relation ${formatElementReference(sourceElement, currentPackageName)} `);
    }

    const firstEndName = formatTontoIdentifier(sourceProperty.getName());
    constructEndMetaAttributes(firstEndName, sourceProperty, currentPackageName, fileNode);
    constructCardinality(sourceProperty.cardinality, fileNode);

    const relationName = formatTontoIdentifier(relation.getName());

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

    const secondEndName = formatTontoIdentifier(targetProperty.getName());
    constructEndMetaAttributes(secondEndName, targetProperty, currentPackageName, fileNode);
    fileNode.append(" ", formatElementReference(targetClass, currentPackageName));

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

    if (metaAttributes.length === 0 && !endName) {
        return;
    }

    fileNode.append("(");
    if (metaAttributes.length > 0) {
        fileNode.append(" {");
        metaAttributes.forEach((metaAttribute, index) => {
            fileNode.append(metaAttribute);
            if (index < metaAttributes.length - 1) {
                fileNode.append(", ");
            }
        });
        fileNode.append(" }");
    }
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

    return `${keyword} ${relationReference}.${formatTontoIdentifier(propertyName)}`;
}

function formatRelationReference(relation: Relation, currentPackageName: string | undefined): string | undefined {
    const relationName = relation.getName();
    if (!relationName) {
        return undefined;
    }

    const sourceReference = formatElementReference(relation.getSource(), currentPackageName);
    return sourceReference ? `${sourceReference}.${formatTontoIdentifier(relationName)}` : formatTontoIdentifier(relationName);
}
