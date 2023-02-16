import {
  AggregationKind, CardinalityValues, Class,
  Package, Property, Relation, RelationStereotype
} from "ontouml-js";
import {
  Cardinality,
  ClassDeclaration,
  ElementRelation,
  RelationMetaAttribute,
  RelationStereotype as MRelationStereotype
} from "../../language-server/generated/ast";
import { RelationTypes } from "../../language-server/models/RelationType";

export function relationGenerator(
  relationItem: ElementRelation,
  packageItem: Package,
  classes: Class[],
  sourceClassIncoming?: ClassDeclaration
): Relation | undefined {
  const sourceClass = sourceClassIncoming ?? relationItem.firstEnd?.ref;
  const destinationClass = relationItem.secondEnd.ref;

  const relationStereotype = getStereotype(relationItem.relationType);

  if (sourceClass && destinationClass) {
    const sourceClassAlreadyCreated = classes.find(
      (item) => item.name.getText() === sourceClass.name
    );
    const destinationClassAlreadyCreated = classes.find(
      (item) => item.name.getText() === destinationClass.name
    );

    if (sourceClassAlreadyCreated && destinationClassAlreadyCreated) {
      const relation = packageItem.createBinaryRelation(
        sourceClassAlreadyCreated,
        destinationClassAlreadyCreated,
        relationItem.name,
        relationStereotype
      );

      const sourceEnd = relation.getSourceEnd();
      const targetEnd = relation.getTargetEnd();

      setMetaAttributes(sourceEnd, relationItem.firstEndMetaAttributes);
      setMetaAttributes(targetEnd, relationItem.secondEndMetaAttributes);

      relationItem.firstEndName && sourceEnd.setName(relationItem.firstEndName);
      relationItem.secondEndName &&
        targetEnd.setName(relationItem.secondEndName);

      setCardinality(relationItem.firstCardinality, sourceEnd);
      setCardinality(relationItem.secondCardinality, targetEnd);

      if (relationItem.relationType === RelationTypes.SUBQUANTITY_OF) {
        relation.getSourceEnd().aggregationKind = AggregationKind.COMPOSITE;
        relation.getTargetEnd().aggregationKind = AggregationKind.NONE;
      }
      else if (relationItem.isComposition) {
        relation.getSourceEnd().aggregationKind = AggregationKind.SHARED;
        relation.getTargetEnd().aggregationKind = AggregationKind.NONE;
      } else if (relationItem.isAssociation) {
        relation.getSourceEnd().aggregationKind = AggregationKind.NONE;
        relation.getTargetEnd().aggregationKind = AggregationKind.NONE;
      }

      return relation;
    }
  }
  return undefined;
}

function setMetaAttributes(
  end: Property,
  metaAttributes: RelationMetaAttribute[]
) {
  metaAttributes.forEach((attribute) => {
    if (attribute.isOrdered) end.isOrdered = attribute.isOrdered;
    if (attribute.isConst) end.isReadOnly = attribute.isConst;
    if (attribute.isDerived) end.isDerived = attribute.isDerived;
  });
}

function setCardinality(
  cardinality: Cardinality | undefined,
  end: Property
): void {
  if (cardinality) {
    if (cardinality.lowerBound === "*") {
      end.cardinality.setZeroToMany();
      return;
    } else if (typeof cardinality.lowerBound === "number") {
      if (!cardinality.upperBound) {
        end.cardinality.setCardinalityFromNumbers(
          cardinality.lowerBound,
          cardinality.lowerBound
        );
      } else {
        end.cardinality.setLowerBoundFromNumber(cardinality.lowerBound);
      }
    }
    if (cardinality.upperBound && cardinality.upperBound === "*") {
      end.cardinality.upperBound = CardinalityValues.MANY;
    } else if (
      cardinality.upperBound &&
      typeof cardinality.upperBound === "number"
    ) {
      end.cardinality.setUpperBoundFromNumber(cardinality.upperBound);
    }
  } else {
    end.cardinality.setZeroToMany();
  }
}

export function relationGeneralizationGenerator(
  model: Package,
  sourceRelation: Relation,
  targetRelation: Relation
) {
  model.createGeneralization(sourceRelation, targetRelation);
}

function getStereotype(
  relationType: MRelationStereotype | undefined
): RelationStereotype | undefined {
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

/* Não existentes?
    case "formal":
    case "inherence":
    case "relator":
    case "value":
*/
