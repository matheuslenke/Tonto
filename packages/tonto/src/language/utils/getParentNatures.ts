import { OntologicalNature } from "ontouml-js";
import { ClassDeclaration, GeneralizationSet, OntologicalNature as ASTNature } from "../generated/ast.js";
import { tontoNatureUtils } from "../models/Natures.js";
import { isUltimateSortalOntoCategory } from "../models/OntologicalCategory.js";
import { getGensetsWhereSpecific } from "./genSetsWhereSpecific.js";

const getParentNatures = (
    actualElement: ClassDeclaration | GeneralizationSet,
    natures: Set<OntologicalNature>,
    genSets: GeneralizationSet[],
    verifiedElements: Array<ClassDeclaration | GeneralizationSet> = []
): Set<OntologicalNature> => {
    /**
   * Because this is a recursive function, we need to add a stop condition
   */
    if (verifiedElements.find((item) => item.name === actualElement.name && item.$type === actualElement.$type)) {
        return natures;
    }
    verifiedElements.push(actualElement);

    if (actualElement.$type === "ClassDeclaration") {
        return getParentNaturesFromClassDeclaration(actualElement, natures, genSets, verifiedElements);
    } else if (actualElement.$type === "GeneralizationSet") {
        return getParentNaturesFromGenset(actualElement, natures, genSets, verifiedElements);
    }
    return natures;
};

function getParentNaturesFromGenset(actualElement: GeneralizationSet, natures: Set<OntologicalNature>, genSets: GeneralizationSet[], verifiedElements: (ClassDeclaration | GeneralizationSet)[]) {
    let parentNatures: Set<OntologicalNature> = new Set();
    if (actualElement.generalItem.ref?.$type === "ClassDeclaration") {
        parentNatures = getParentNatures(actualElement.generalItem.ref, natures, genSets, verifiedElements);
    }
    parentNatures.forEach((nature) => natures.add(nature));
    return natures;
}

function getParentNaturesFromClassDeclaration(actualElement: ClassDeclaration, natures: Set<OntologicalNature>, genSets: GeneralizationSet[], verifiedElements: (ClassDeclaration | GeneralizationSet)[]) {
    actualElement.specializationEndurants.forEach((specializationItem) => {
        const specItem = specializationItem.ref;
        if (!specItem) {
            return;
        }
        let specElementNatures: OntologicalNature[] = [];
        if (isUltimateSortalOntoCategory(specItem?.classElementType.ontologicalCategory)) {
            const sortalNature = tontoNatureUtils.getNatureFromUltimateSortal(specItem);
            if (sortalNature) {
                specElementNatures = [sortalNature];
            }
        } else {
            specElementNatures = parseOntologicalNatures(specItem.ontologicalNatures?.natures);
        }
        specElementNatures.forEach((nature) => natures.add(nature));

        const parentNatures = getParentNatures(specItem, natures, genSets, verifiedElements);

        parentNatures.forEach((nature) => natures.add(nature));
    });

    let currentElementNatures: OntologicalNature[] = [];
    if (isUltimateSortalOntoCategory(actualElement?.classElementType.ontologicalCategory)) {
        const sortalNature = tontoNatureUtils.getNatureFromUltimateSortal(actualElement);
        if (sortalNature) {
            currentElementNatures = [sortalNature];
        }
    } else {
        currentElementNatures = parseOntologicalNatures(actualElement.ontologicalNatures?.natures);
    }
    const genSetsWithElement: GeneralizationSet[] = getGensetsWhereSpecific(actualElement.name, genSets);
    let parentGenSetNatures: Set<OntologicalNature> = new Set();

    genSetsWithElement.forEach((genSet) => {
        parentGenSetNatures = getParentNatures(genSet, natures, genSets, verifiedElements);
    });
    currentElementNatures.forEach((nature) => natures.add(nature));
    parentGenSetNatures.forEach((nature) => natures.add(nature));
    return natures;
}

function parseOntologicalNatures(natures?: ASTNature[]): OntologicalNature[] {
    if (!natures) {
        return [];
    }
    return natures.flatMap((nature) => tontoNatureUtils.getNatureFromAst(nature) || []);
}

export { getParentNatures };
