import { CompositeGeneratorNode, NL } from "langium";
import {
  AggregationKind,
  Cardinality,
  Class,
  Generalization,
  Property,
  Relation,
} from "ontouml-js";
import { notEmpty } from "../../utils/isEmpty";
import { replaceWhitespace } from "../utils/replaceWhitespace";

export function constructInternalRelations(
  element: Class,
  relations: Relation[],
  fileNode: CompositeGeneratorNode
) {
  relations.forEach((relation) => {
    //   const sourceClass = relation.getSourceClass();
    const sourceProperty = relation.getSourceClassEnd();
    const targetClass = relation.getTargetClass();
    const targetProperty = relation.getTargetClassEnd();
    const generalizations = relation.getGeneralizationsWhereGeneral();

    const sourceClassPackage = element.getModelOrRootPackage();
    const sourceName = sourceClassPackage.getName();
    const targetClassPackage = targetClass.getModelOrRootPackage();
    const targetName = targetClassPackage.getName();

    // FirstEnd Name
    const firstEndName = replaceWhitespace(sourceProperty.getName());
    if (firstEndName) {
      fileNode.append(`(${firstEndName})`);
    }

    // FirstEnd Meta Attributes
    constructEndMetaAttributes(sourceProperty, fileNode);

    // First Cardinality
    constructCardinality(sourceProperty.cardinality, fileNode);

    const relationName = replaceWhitespace(relation.getName());

    if (sourceProperty.aggregationKind === AggregationKind.COMPOSITE) {
      fileNode.append("<>-- ");
      if (relationName) {
        fileNode.append(`${relationName}`);
        constructRelationSpecializations(generalizations, fileNode);
        fileNode.append(" <>-- ");
      }
    } else {
      fileNode.append("-- ");
      if (relationName) {
        fileNode.append(`${relationName}`);
        constructRelationSpecializations(generalizations, fileNode);
        fileNode.append(" -- ");
      }
    }
    // Second Cardinality
    const {
      lowerBound: targetLowerBound,
      upperBound: targetUpperBound,
    } = targetProperty.cardinality.getCardinalityBounds();

    fileNode.append(` [${targetLowerBound}..${targetUpperBound}] `);

    // SecondEnd Meta Attributes
    constructEndMetaAttributes(targetProperty, fileNode);

    // Second Name
    const secondEndName = replaceWhitespace(targetProperty.getName());
    if (secondEndName) {
      fileNode.append(`(${secondEndName})`);
    }

    let targetClassName = targetClass.getName();
    if (targetName !== sourceName) {
      targetClassName = `${targetClassPackage.getName()}.${targetClass.getName()}`;
    }

    fileNode.append(" ", replaceWhitespace(targetClassName));
    fileNode.append(NL);
  });
}

function constructCardinality(
  cardinality: Cardinality,
  fileNode: CompositeGeneratorNode
) {
  const {
    lowerBound: targetLowerBound,
    upperBound: targetUpperBound,
  } = cardinality.getCardinalityBounds();

  fileNode.append(` [${targetLowerBound}..${targetUpperBound}] `);
}

function constructEndMetaAttributes(
  property: Property,
  fileNode: CompositeGeneratorNode
) {
  const firstEndMetaAttributes = [
    property.isDerived ? "derived" : null,
    property.isOrdered ? "ordered" : null,
    property.isReadOnly ? "const" : null,
  ].filter(notEmpty);

  if (firstEndMetaAttributes.length > 0) {
    fileNode.append(" {");
    firstEndMetaAttributes.forEach((metaAttribute, index) => {
      fileNode.append(metaAttribute);
      if (index < firstEndMetaAttributes.length - 1) {
        fileNode.append(", ");
      }
    });
    fileNode.append("}");
  }
}

function constructRelationSpecializations(
  generalizations: Generalization[],
  fileNode: CompositeGeneratorNode
) {
  if (generalizations.length > 0) {
    fileNode.append(" specializes ");
    generalizations.forEach((generalization, index) => {
      fileNode.append(
        `${replaceWhitespace(generalization.getSpecificRelation().getName())}`
      );
      if (index < generalizations.length - 1) {
        fileNode.append(",");
      }
    });
  }
}
