import { AggregationKind, Class, Package, Property, Relation, RelationStereotype } from "ontouml-js";
import {
    ClassDeclaration,
    ElementRelation,
    isClassDeclaration,
    RelationMetaAttributes
} from "../../language/generated/ast.js";
import { RelationTypes } from "../../language/models/RelationType.js";
import {
    JSON_GENERATION_STEPS,
    createJsonGenerationError,
    createJsonGenerationNodeInfo,
} from "../requests/jsonGeneration.js";
import { setPropertyCardinality } from "./cardinality.generator.js";

export function getElementRelationLookupKey(
    relationItem: ElementRelation,
    sourceClassIncoming?: ClassDeclaration
): string | undefined {
    if (!relationItem.name) {
        return undefined;
    }

    if (sourceClassIncoming) {
        return `${sourceClassIncoming.name}.${relationItem.name}`;
    }

    const relationContainer = relationItem.$container;
    if (relationContainer.$type === "ClassDeclaration") {
        return `${relationContainer.name}.${relationItem.name}`;
    }

    const sourceElement = relationItem.firstEnd?.ref;
    if (sourceElement && "name" in sourceElement && typeof sourceElement.name === "string") {
        return `${sourceElement.name}.${relationItem.name}`;
    }

    return relationItem.name;
}

export function findGeneratedRelation(
    relations: Relation[],
    relationItem: ElementRelation | undefined,
    sourceClassIncoming?: ClassDeclaration,
    resolveRelation?: (relationItem: ElementRelation | undefined) => Relation | undefined
): Relation | undefined {
    const resolvedRelation = resolveRelation?.(relationItem);
    if (resolvedRelation) {
        return resolvedRelation;
    }

    if (!relationItem) {
        return undefined;
    }

    const lookupKey = getElementRelationLookupKey(relationItem, sourceClassIncoming);
    if (!lookupKey) {
        return undefined;
    }

    return relations.find((relation) => relation.id === lookupKey);
}

export function relationGenerator(
    relationItem: ElementRelation,
    packageItem: Package,
    classes: Class[],
    sourceClassIncoming?: ClassDeclaration,
    resolveClass?: (classDeclaration: ClassDeclaration | undefined) => Class | undefined
): Relation | undefined {
    const sourceClass = sourceClassIncoming ?? relationItem.firstEnd?.ref;
    const destinationClass = relationItem.secondEnd?.ref;

    const relationStereotype = getStereotype(relationItem.relationType);

    if (!sourceClass || !destinationClass) {
        throw createJsonGenerationError(`Could not generate relation ${getRelationLabel(relationItem)}.`, {
            step: JSON_GENERATION_STEPS.relationGeneration,
            info: [
                createJsonGenerationNodeInfo(relationItem, {
                    code: "missing_relation_endpoint_reference",
                    title: "Missing relation endpoint reference",
                    description: `Relation ${getRelationLabel(relationItem)} must declare both source and target class references before it can be included in the generated JSON.`,
                }),
            ],
        });
    }

    const sourceClassAlreadyCreated = isClassDeclaration(sourceClass)
        ? (resolveClass?.(sourceClass) ?? classes.find((item) => item.id === sourceClass.name))
        : classes.find((item) => item.id === sourceClass.name);
    const destinationClassAlreadyCreated = isClassDeclaration(destinationClass)
        ? (resolveClass?.(destinationClass) ?? classes.find((item) => item.id === destinationClass.name))
        : classes.find((item) => item.id === destinationClass.name);

    if (!sourceClassAlreadyCreated || !destinationClassAlreadyCreated) {
        throw createJsonGenerationError(`Could not generate relation ${getRelationLabel(relationItem)}.`, {
            step: JSON_GENERATION_STEPS.relationGeneration,
            info: [
                createJsonGenerationNodeInfo(relationItem, {
                    code: "unresolved_relation_endpoint",
                    title: "Unresolved relation endpoint",
                    description: `Relation ${getRelationLabel(relationItem)} refers to "${getClassReferenceName(sourceClass)}" -> "${getClassReferenceName(destinationClass)}", but one or both endpoint classes were not generated. Check the declarations and imported packages for those classes.`,
                }),
            ],
        });
    }

    const relation = packageItem.createBinaryRelation(
        sourceClassAlreadyCreated,
        destinationClassAlreadyCreated,
        relationItem.name,
        relationStereotype
    );
    const lookupKey = getElementRelationLookupKey(relationItem, sourceClassIncoming);
    if (lookupKey) {
        relation.id = lookupKey;
    }

    const sourceEnd = relation.getSourceEnd();
    const targetEnd = relation.getTargetEnd();

    setMetaAttributes(sourceEnd, relationItem.firstEndMetaAttributes);
    setMetaAttributes(targetEnd, relationItem.secondEndMetaAttributes);

    relationItem.firstEndMetaAttributes &&
    relationItem.firstEndMetaAttributes.endName &&
    sourceEnd.setName(relationItem.firstEndMetaAttributes.endName);
    relationItem.secondEndMetaAttributes &&
    relationItem.secondEndMetaAttributes.endName &&
    targetEnd.setName(relationItem.secondEndMetaAttributes.endName);

    setPropertyCardinality(relationItem.firstCardinality, sourceEnd);
    setPropertyCardinality(relationItem.secondCardinality, targetEnd);

    if (relationItem.relationType === RelationTypes.SUBQUANTITY_OF) {
        relation.getSourceEnd().aggregationKind = AggregationKind.COMPOSITE;
        relation.getTargetEnd().aggregationKind = AggregationKind.NONE;
    } else if (relationItem.isAggregation) {
        /**
     * Based on relation type, set aggregation kind
     * Aggregation: <>--
     * Association: --
     * Composition: <o>--
     */
        relation.getSourceEnd().aggregationKind = AggregationKind.SHARED;
        relation.getTargetEnd().aggregationKind = AggregationKind.NONE;
    } else if (relationItem.isComposition) {
        relation.getSourceEnd().aggregationKind = AggregationKind.COMPOSITE;
        relation.getTargetEnd().aggregationKind = AggregationKind.NONE;
    }
    // else if (relationItem.isCompositionInverted) {
    //   relation.getSourceEnd().aggregationKind = AggregationKind.NONE;
    //   relation.getTargetEnd().aggregationKind = AggregationKind.COMPOSITE;
    // } else if (relationItem.isAggregationInverted) {
    //   relation.getSourceEnd().aggregationKind = AggregationKind.NONE;
    //   relation.getTargetEnd().aggregationKind = AggregationKind.SHARED;
    // }
    else if (relationItem.isAssociation) {
        relation.getSourceEnd().aggregationKind = AggregationKind.NONE;
        relation.getTargetEnd().aggregationKind = AggregationKind.NONE;
    }

    return relation;
}

function setMetaAttributes(end: Property, metaAttributes: RelationMetaAttributes | undefined) {
    if (!metaAttributes) {
        return;
    }
    metaAttributes.endMetaAttributes.forEach((attribute) => {
        if (attribute.isOrdered) end.isOrdered = attribute.isOrdered;
        if (attribute.isConst) end.isReadOnly = attribute.isConst;
        if (attribute.isDerived) end.isDerived = attribute.isDerived;
    });
}

export function relationGeneralizationGenerator(model: Package, sourceRelation: Relation, targetRelation: Relation) {
    model.createGeneralization(sourceRelation, targetRelation);
}

function getStereotype(relationType: string | undefined): RelationStereotype | undefined {
    switch (relationType) {
        case "bringsAbout":
            return RelationStereotype.BRINGS_ABOUT;
        case "characterization":
            return RelationStereotype.CHARACTERIZATION;
        case "comparative":
            return RelationStereotype.COMPARATIVE;
        case "componentOf":
            return RelationStereotype.COMPONENT_OF;
        case "creation":
            return RelationStereotype.CREATION;
        case "derivation":
            return RelationStereotype.DERIVATION;
        case "externalDependence":
            return RelationStereotype.EXTERNAL_DEPENDENCE;
        case "historicalDependence":
            return RelationStereotype.HISTORICAL_DEPENDENCE;
        case "instantiation":
            return RelationStereotype.INSTANTIATION;
        case "manifestation":
            return RelationStereotype.MANIFESTATION;
        case "material":
            return RelationStereotype.MATERIAL;
        case "mediation":
            return RelationStereotype.MEDIATION;
        case "memberOf":
            return RelationStereotype.MEMBER_OF;
        case "participation":
            return RelationStereotype.PARTICIPATION;
        case "participational":
            return RelationStereotype.PARTICIPATIONAL;
        case "subCollectionOf":
            return RelationStereotype.SUBCOLLECTION_OF;
        case "subQuantityOf":
            return RelationStereotype.SUBQUANTITY_OF;
        case "termination":
            return RelationStereotype.TERMINATION;
        case "triggers":
            return RelationStereotype.TRIGGERS;
        default:
            // Qual seria o default?
            return undefined;
    }
}

function getRelationLabel(relationItem: ElementRelation): string {
    return relationItem.name ? `"${relationItem.name}"` : "(unnamed relation)";
}

function getClassReferenceName(reference: { name?: string } | undefined): string {
    return reference?.name ?? "(unknown class)";
}

/* Não existentes?
    case "formal":
    case "inherence":
    case "relator":
    case "value":
*/
