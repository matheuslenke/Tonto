import { CompositeGeneratorNode, NL } from "langium";
import { Class, ClassStereotype, Property } from "ontouml-js";
import { formatForId } from "../utils/replaceWhitespace";
import { createInstantiation } from "./instantiation.constructor";
import { constructInternalRelations } from "./relation.constructor";
import { createSpecializations } from "./specialization.constructor";
import { constructAttributes } from "./attributes.constructor";

export function constructClassElement(element: Class, fileNode: CompositeGeneratorNode) {
  const stereotypeWord = getStereotypeWord(element.stereotype);

  if (element.stereotype === ClassStereotype.ENUMERATION) {
    createEnumeration(element, fileNode);
  } else if (element.stereotype === ClassStereotype.DATATYPE) {
    createDatatype(element, fileNode);
  } else {
    fileNode.append(`${stereotypeWord} ${formatForId(element.getName())} `);

    // Construct Nature restrictions
    createNatures(element, fileNode);

    createInstantiation(element, fileNode);

    // Construct specializations
    createSpecializations(element, fileNode);

    const relations = element.getOwnOutgoingRelations();
    const attributes: Property[] = element.getOwnAttributes();
    if (relations.length > 0) {
      fileNode.append("{", NL);
      if (attributes.length > 0) {
        fileNode.indent((ident) => {
          constructAttributes(attributes, ident);
        });
      }
      fileNode.indent((ident) => {
        constructInternalRelations(element, relations, ident);
      });
      fileNode.append("}");
    }
    fileNode.append(NL);
  }
}

function createEnumeration(element: Class, fileNode: CompositeGeneratorNode) {
  fileNode.append(`enum ${formatForId(element.getName())} {`, NL);

  const literals = element.getOwnLiterals();
  fileNode.indent((ident) => {
    literals.forEach((literal, index) => {
      if (index < literals.length - 1) {
        ident.append(formatForId(literal.getNameOrId()), ",", NL);
      } else {
        ident.append(formatForId(literal.getNameOrId()), NL);
      }
    });
  });

  fileNode.append("}", NL);
}

function createDatatype(element: Class, fileNode: CompositeGeneratorNode) {
  fileNode.append(`datatype ${formatForId(element.getName())}`);

  const literals = element.getOwnAttributes();

  if (literals.length > 0) {
    fileNode.append(" {", NL);

    fileNode.indent((ident) => {
      literals.forEach((literal) => {
        const propertyType = literal.propertyType;
        if (propertyType) {
          ident.append(formatForId(literal.getNameOrId()), " : ", propertyType.getNameOrId(), NL);
        } else {
          // TODO: Add literal without propertyType
        }
      });
    });

    fileNode.append("}", NL);
  } else {
    fileNode.appendNewLine();
  }
}

function createNatures(element: Class, fileNode: CompositeGeneratorNode) {
  if (element.stereotype === ClassStereotype.ABSTRACT) {
    fileNode.append("of abstract-individuals");
  }
}

function getStereotypeWord(stereotype: ClassStereotype): string {
  switch (stereotype) {
    case ClassStereotype.TYPE:
      return "type";
    case ClassStereotype.HISTORICAL_ROLE:
      return "historicalRole";
    case ClassStereotype.HISTORICAL_ROLE_MIXIN:
      return "historicalRoleMixin";
    case ClassStereotype.EVENT:
      return "event";
    case ClassStereotype.SITUATION:
      return "situation";
    case ClassStereotype.CATEGORY:
      return "category";
    case ClassStereotype.MIXIN:
      return "mixin";
    case ClassStereotype.ROLE_MIXIN:
      return "roleMixin";
    case ClassStereotype.PHASE_MIXIN:
      return "phaseMixin";
    case ClassStereotype.KIND:
      return "kind";
    case ClassStereotype.COLLECTIVE:
      return "collective";
    case ClassStereotype.QUANTITY:
      return "quantity";
    case ClassStereotype.RELATOR:
      return "relator";
    case ClassStereotype.QUALITY:
      return "quality";
    case ClassStereotype.MODE:
      return "mode";
    case ClassStereotype.SUBKIND:
      return "subkind";
    case ClassStereotype.ROLE:
      return "role";
    case ClassStereotype.PHASE:
      return "phase";
    case ClassStereotype.ENUMERATION:
      return "enum";
    case ClassStereotype.DATATYPE:
      return "datatype";
    case ClassStereotype.ABSTRACT:
      return "class";
    default:
      return "class";
  }
}
