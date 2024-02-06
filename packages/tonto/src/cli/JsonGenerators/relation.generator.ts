import { AggregationKind, Class, Package, Property, Relation, RelationStereotype } from "ontouml-js";
import {
  ClassDeclaration,
  ElementRelation,
  RelationStereotype as MRelationStereotype,
  RelationMetaAttributes,
} from "../../language/generated/ast.js";
import chalk from "chalk";
import { setPropertyCardinality } from "./cardinality.generator.js";
import { RelationTypes } from "../../language/models/RelationType.js";

export function relationGenerator(
  relationItem: ElementRelation,
  packageItem: Package,
  classes: Class[],
  sourceClassIncoming?: ClassDeclaration
): Relation | undefined {
  const sourceClass = sourceClassIncoming ?? relationItem.firstEnd?.ref;
  const destinationClass = relationItem.secondEnd?.ref;

  const relationStereotype = getStereotype(relationItem.relationType);

  if (sourceClass && destinationClass) {
    const sourceClassAlreadyCreated = classes.find((item) => item.name.getText() === sourceClass.name);
    const destinationClassAlreadyCreated = classes.find((item) => item.name.getText() === destinationClass.name);

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
      } else if (relationItem.isCompositionInverted) {
        relation.getSourceEnd().aggregationKind = AggregationKind.NONE;
        relation.getTargetEnd().aggregationKind = AggregationKind.COMPOSITE;
      } else if (relationItem.isAggregationInverted) {
        relation.getSourceEnd().aggregationKind = AggregationKind.NONE;
        relation.getTargetEnd().aggregationKind = AggregationKind.SHARED;
      } else if (relationItem.isAssociation) {
        relation.getSourceEnd().aggregationKind = AggregationKind.NONE;
        relation.getTargetEnd().aggregationKind = AggregationKind.NONE;
      }

      return relation;
    } else {
      console.log(
        chalk.yellow(
          `Could not create relation named (${relationItem.name ?? "(No name)"}) between ${sourceClass.name} and ${
            destinationClass.name
          } because one or both of them was not created.`
        )
      );
    }
  }
  return undefined;
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

function getStereotype(relationType: MRelationStereotype | undefined): RelationStereotype | undefined {
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
