import { CompositeGeneratorNode, NL } from "langium";
import { Class, ClassStereotype, OntoumlType, Package } from "ontouml-js";
import { replaceWhitespace } from "../utils/replaceWhitespace";
import { createInstantiation } from "./instantiation.constructor";
import { constructInternalRelations } from "./relation.constructor";
import { createSpecializations } from "./specialization.constructor";

export function constructClassElement(
  packageItem: Package,
  element: Class,
  fileNode: CompositeGeneratorNode
) {
  const stereotypeWord = getStereotypeWord(element.stereotype);
  const isBasicDataType =
    element.getName() === "Date" ||
    element.getName() === "string" ||
    element.getName() === "boolean" ||
    element.getName() === "number";
  if (
    element.type === OntoumlType.CLASS_TYPE &&
    element.stereotype === ClassStereotype.DATATYPE &&
    isBasicDataType
  ) {
    return;
  }
  if (element.stereotype === ClassStereotype.ENUMERATION) {
    createEnumeration(element, fileNode);
  } else if (element.stereotype === ClassStereotype.DATATYPE) {
    createDatatype(element, fileNode);
  } else {
    fileNode.append(
      `${stereotypeWord} ${replaceWhitespace(element.getName())} `
    );

    createInstantiation(element, fileNode);

    // Construct specializations
    createSpecializations(element, fileNode);

    // Construct Nature restrictions
    const relations = element.getOwnOutgoingRelations();
    const attributes = element.getAllAttributes();

    if (relations.length > 0) {
      fileNode.append("{", NL);
      if (attributes.length > 0) {
        // fileNode.indent((ident) => {
        //   // constructAttributes(packageItem, element, attributes, ident);
        // });
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
  fileNode.append(`enum ${replaceWhitespace(element.getName())} {`, NL);

  const literals = element.getOwnLiterals();
  fileNode.indent((ident) => {
    literals.forEach((literal, index) => {
      if (index < literals.length - 1) {
        ident.append(replaceWhitespace(literal.getNameOrId()), ",", NL);
      } else {
        ident.append(replaceWhitespace(literal.getNameOrId()), NL);
      }
    });
  });

  fileNode.append("}", NL);
}

function createDatatype(element: Class, fileNode: CompositeGeneratorNode) {
  fileNode.append(`datatype ${replaceWhitespace(element.getName())} {`, NL);

  // const literals = element.getAllAttributes();

  // fileNode.indent((ident) => {
  //   literals.forEach((literal, index) => {
  //     if (index < literals.length - 1) {
  //       ident.append(replaceWhitespace(literal.getNameOrId()), ",", NL);
  //     } else {
  //       ident.append(replaceWhitespace(literal.getNameOrId()), NL);
  //     }
  //   });
  // });

  fileNode.append("}", NL);
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
    return "abstract";
  default:
    return "class";
  }
}
