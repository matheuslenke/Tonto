import { CompositeGeneratorNode, NL } from "langium";
import { AggregationKind, Class, Generalization, Property, Relation } from "ontouml-js";
import { notEmpty } from "../../utils/isEmpty";
import { formatForId } from "../utils/replaceWhitespace";
import { constructCardinality } from "./cardinality.constructor";

export function constructInternalRelations(element: Class, relations: Relation[], fileNode: CompositeGeneratorNode) {
  relations
    .filter((item) => item.isBinary() === true)
    .forEach((relation) => {
      constructRelation(relation, element, fileNode);
    });
}

function constructRelation(relation: Relation, element: Class, fileNode: CompositeGeneratorNode) {
  const sourceProperty = relation.getSourceEnd();
  const targetClass = relation.getTarget();
  const targetProperty = relation.getTargetEnd();
  const generalizations = relation.getGeneralizationsWhereGeneral();

  const sourceClassPackage = element.getModelOrRootPackage();
  const sourceName = sourceClassPackage.getName();
  const targetClassPackage = targetClass.getModelOrRootPackage();
  const targetName = targetClassPackage.getName();
  if (element.getName() === "Collection") {
    console.log("foi");
  }

  // Stereotype
  if (relation.stereotype) {
    fileNode.append(`@${relation.stereotype}`, NL);
  }

  // FirstEnd Name
  const firstEndName = formatForId(sourceProperty.getName());
  // FirstEnd Meta Attributes
  constructEndMetaAttributes(firstEndName, sourceProperty, fileNode);

  // First Cardinality
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
    // Here, we need to check if we have a basic association or a inverted relation
    if (targetProperty.isAggregationEnd()) {
      if (relationName) {
        fileNode.append(" -- ");
        fileNode.append(`${relationName}`);
      }
      fileNode.append(" --<o> ");
    } else if (targetProperty.isComposite()) {
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
  // Second Cardinality
  constructCardinality(targetProperty.cardinality, fileNode);

  // Second Name
  const secondEndName = formatForId(targetProperty.getName());
  // SecondEnd Meta Attributes
  constructEndMetaAttributes(secondEndName, targetProperty, fileNode);

  let targetClassName = targetClass.getName();
  if (targetName !== sourceName) {
    targetClassName = `${targetClassPackage.getName()}.${targetClass.getName()}`;
  }

  fileNode.append(" ", formatForId(targetClassName));

  constructRelationSpecializations(generalizations, fileNode);
  fileNode.append(NL);
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

function constructRelationSpecializations(generalizations: Generalization[], fileNode: CompositeGeneratorNode) {
  if (generalizations.length > 0) {
    fileNode.append(" specializes ");
    generalizations.forEach((generalization, index) => {
      if (generalization.involvesRelations()) {
        const relationName = formatForId(generalization.getSpecificRelation().getName());
        const properties = generalization.specific.properties;
        const property = properties.at(0);
        if (property) {
          const className = formatForId(property.propertyType.getName());
          fileNode.append(`${className}.${relationName}`);
        } else {
          fileNode.append(`${relationName}`);
        }
      }

      if (index < generalizations.length - 1) {
        fileNode.append(",");
      }
    });
  }
}
