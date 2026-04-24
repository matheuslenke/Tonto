
import { CompositeGeneratorNode, NL } from "langium/generate";
import { Class, ClassStereotype, Property } from "ontouml-js";
import { constructAttributes } from "./attributes.constructor.js";
import { createInstantiation } from "./instantiation.constructor.js";
import {
    appendLabelAndDescription,
    formatTontoIdentifier,
    getRenderableElementName,
    hasRenderableDocumentation,
} from "./renderUtils.js";
import { constructInternalRelations } from "./relation.constructor.js";
import { createSpecializations } from "./specialization.constructor.js";

export function constructClassElement(element: Class, fileNode: CompositeGeneratorNode) {
    const stereotypeWord = getStereotypeWord(element.stereotype);

    if (element.stereotype === ClassStereotype.ENUMERATION) {
        createEnumeration(element, fileNode);
    } else if (element.stereotype === ClassStereotype.DATATYPE) {
        createDatatype(element, fileNode);
    } else {
        const identifier = formatTontoIdentifier(getRenderableElementName(element));
        fileNode.append(`${stereotypeWord} ${identifier}`);

        // Construct Nature restrictions
        createNatures(element, fileNode);

        createInstantiation(element, fileNode);

        // Construct specializations
        createSpecializations(element, fileNode);

        const relations = element.getOwnOutgoingRelations();
        const attributes: Property[] = element.getOwnAttributes();
        const hasBody = hasRenderableDocumentation(element, identifier) || relations.length > 0 || attributes.length > 0;
        if (hasBody) {
            fileNode.append(" {", NL);
            fileNode.indent((ident) => {
                appendLabelAndDescription(element, identifier, ident);
                constructAttributes(attributes, ident, element);
            });
            fileNode.indent((ident) => {
                constructInternalRelations(element, relations, ident);
            });
            fileNode.append("}");
        }
        fileNode.append(NL);
    }
}

function createEnumeration(element: Class, fileNode: CompositeGeneratorNode) {
    const identifier = formatTontoIdentifier(getRenderableElementName(element));
    fileNode.append(`enum ${identifier}`);
    createSpecializations(element, fileNode);

    const literals = element.getOwnLiterals();
    const hasBody = hasRenderableDocumentation(element, identifier) || literals.length > 0;
    if (hasBody) {
        fileNode.append(" {", NL);

        fileNode.indent((ident) => {
            appendLabelAndDescription(element, identifier, ident);
            literals.forEach((literal, index) => {
                if (index < literals.length - 1) {
                    ident.append(formatTontoIdentifier(getRenderableElementName(literal)), ",", NL);
                } else {
                    ident.append(formatTontoIdentifier(getRenderableElementName(literal)), NL);
                }
            });
        });

        fileNode.append("}", NL);
    } else {
        fileNode.appendNewLine();
    }
}

function createDatatype(element: Class, fileNode: CompositeGeneratorNode) {
    const identifier = formatTontoIdentifier(getRenderableElementName(element));
    fileNode.append(`datatype ${identifier}`);
    createSpecializations(element, fileNode);

    const literals = element.getOwnAttributes();

    const hasBody = hasRenderableDocumentation(element, identifier) || literals.length > 0;
    if (hasBody) {
        fileNode.append(" {", NL);

        fileNode.indent((ident) => {
            appendLabelAndDescription(element, identifier, ident);
            literals.forEach((literal) => {
                constructAttributes([literal], ident, element);
            });
        });

        fileNode.append("}", NL);
    } else {
        fileNode.appendNewLine();
    }
}

function createNatures(element: Class, fileNode: CompositeGeneratorNode) {
    if (element.stereotype === ClassStereotype.ABSTRACT) {
        fileNode.append(" of abstract-individuals");
    }
}

export function getStereotypeWord(stereotype: ClassStereotype): string {
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
