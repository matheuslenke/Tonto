import { OntoumlElement, OntoumlType } from "ontouml-js";

export const getNearestParentPackage = (ontoumlElement: OntoumlElement | undefined): OntoumlElement | undefined => {
    const parent = ontoumlElement?.container;
    if (!parent) {
        return undefined;
    }
    if (parent?.type === OntoumlType.PACKAGE_TYPE) {
        return parent;
    } else {
        return getNearestParentPackage(ontoumlElement);
    }
};