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
import { formatForId } from "../utils/replaceWhitespace";

export function constructInternalRelations(
  element: Class,
  relations: Relation[],
  fileNode: CompositeGeneratorNode
) {
  relations.forEach((relation) => {
    const sourceProperty = relation.getSourceClassEnd();
    const targetClass = relation.getTargetClass();
    const targetProperty = relation.getTargetClassEnd();
    const generalizations = relation.getGeneralizationsWhereGeneral();

    const sourceClassPackage = element.getModelOrRootPackage();
    const sourceName = sourceClassPackage.getName();
    const targetClassPackage = targetClass.getModelOrRootPackage();
    const targetName = targetClassPackage.getName();

    // FirstEnd Name
    const firstEndName = formatForId(sourceProperty.getName());
    // FirstEnd Meta Attributes
    constructEndMetaAttributes(firstEndName, sourceProperty, fileNode);

    // First Cardinality
    constructCardinality(sourceProperty.cardinality, fileNode);

    const relationName = formatForId(relation.getName());

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

    // Second Name
    const secondEndName = formatForId(targetProperty.getName());
    // SecondEnd Meta Attributes
    constructEndMetaAttributes(secondEndName, targetProperty, fileNode);


    let targetClassName = targetClass.getName();
    if (targetName !== sourceName) {
      targetClassName = `${targetClassPackage.getName()}.${targetClass.getName()}`;
    }

    fileNode.append(" ", formatForId(targetClassName));
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
  firstEndName: string | undefined,
  property: Property,
  fileNode: CompositeGeneratorNode
) {
  const firstEndMetaAttributes = [
    property.isDerived ? "derived" : null,
    property.isOrdered ? "ordered" : null,
    property.isReadOnly ? "const" : null,
  ].filter(notEmpty);

  if (firstEndMetaAttributes.length > 0) {
    fileNode.append("( {");
    firstEndMetaAttributes.forEach((metaAttribute, index) => {
      fileNode.append(metaAttribute);
      if (index < firstEndMetaAttributes.length - 1) {
        fileNode.append(", ");
      }
    });
    fileNode.append(" }");
    if (firstEndName) {
      fileNode.append(` ${firstEndName}`);
    }
    fileNode.append(" )");
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
        `${formatForId(generalization.getSpecificRelation().getName())}`
      );
      if (index < generalizations.length - 1) {
        fileNode.append(",");
      }
    });
  }
}
