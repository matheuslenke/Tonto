
import { CompositeGeneratorNode, NL } from "langium/generate";
import { Class, GeneralizationSet, OntoumlElement, OntoumlType, Relation } from "ontouml-js";
import { constructClassElement } from "./classElement.constructor.js";
import { formatTontoQualifiedName } from "./renderUtils.js";

import { Generated, expandToNode, joinToNode } from "langium/generate";
import { constructGenSet } from "./genset.constructor.js";
import { constructExternalRelations } from "./relation.constructor.js";

/**
 * This function is the entry point for creating a Tonto Model based on an OntoUML
 * element.
 * @param element The parsed OntoUML Element from ontouml-js
 * @param fileNode The node which the generated file is created
 * @returns 
 */
export function createTontoPackage(packageItem: OntoumlElement, fileNode: CompositeGeneratorNode): Generated {
    // return generateTonto(element);
    fileNode.append(`package ${formatTontoQualifiedName(packageItem.getNameOrId())}`, NL, NL);
    const classes = packageItem
        .getContents()
        .filter((item) => item.type === OntoumlType.CLASS_TYPE)
        .map((item) => item as Class);

    packageItem.getContents().forEach((content) => {
        if (content.type === OntoumlType.CLASS_TYPE) {
            const classItem = content as Class;
            constructClassElement(classItem, fileNode);
        }
        if (content.type === OntoumlType.GENERALIZATION_SET_TYPE) {
            const genSet = content as GeneralizationSet;
            constructGenSet(genSet, fileNode);
        }
    });

    const localClassIds = new Set(classes.map((classItem) => classItem.id));
    const residualExternalRelations = packageItem
        .getContents()
        .filter((item) => item.type === OntoumlType.RELATION_TYPE)
        .map((item) => item as Relation)
        .filter((relation) => {
            const source = relation.getSource();
            return !(source instanceof Class) || !localClassIds.has(source.id);
        });

    constructExternalRelations(residualExternalRelations, fileNode);
    fileNode.append(NL);
    return fileNode;
}

function joinWithExtraNL<T>(content: T[], toString: (e: T) => Generated): Generated {
    return joinToNode(content, toString, { appendNewLineIfNotEmpty: true });
}

export function generateTonto(element: OntoumlElement): Generated {
    const classes = element
        .getContents()
        .filter((item) => item.type === OntoumlType.CLASS_TYPE)
        .map((item) => item as Class);
    return expandToNode`
    package ${formatTontoQualifiedName(element.getNameOrId())}

    ${joinWithExtraNL(classes, (classItem) => `${classItem.getName()}`)}
  `;
}
