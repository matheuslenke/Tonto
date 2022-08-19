import {
  Cardinality,
  ElementRelation,
  RelationStereotype as MRelationStereotype,
} from "../../language-server/generated/ast";
import {
  Class,
  Package,
  RelationStereotype,
  Property,
  CardinalityValues,
} from "ontouml-js";

export function relationGenerator(
  relationItem: ElementRelation,
  packageItem: Package,
  classes: Class[]
): void {
  const sourceClass = relationItem.firstEnd?.ref;
  const destinationClass = relationItem.secondEnd.ref;

  let relationStereotype = getStereotype(relationItem.relationType);

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
      setCardinality(relationItem.firstCardinality, relation.getSourceEnd());
      setCardinality(relationItem.secondCardinality, relation.getTargetEnd());
    }
  }
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
      end.cardinality.setLowerBoundFromNumber(cardinality.lowerBound);
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
