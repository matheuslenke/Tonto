import { ClassDeclaration, OntologicalNature as ASTNature, GeneralizationSet } from "../generated/ast.js";
import { OntologicalNature } from "ontouml-js";
import { tontoNatureUtils } from "../models/Natures.js";
import { isUltimateSortalOntoCategory } from "../models/OntologicalCategory.js";
import { getGensetsWhereSpecific } from "./genSetsWhereSpecific.js";

const getParentNatures = (
  actualElement: ClassDeclaration | GeneralizationSet,
  natures: OntologicalNature[],
  genSets: GeneralizationSet[],
  verifiedElements: Array<ClassDeclaration | GeneralizationSet> = []
): OntologicalNature[] => {
  /**
   * Because this is a recursive function, we need to add a stop condition
   */
  if (verifiedElements.find((item) => item.name === actualElement.name && item.$type === actualElement.$type)) {
    return natures;
  }
  verifiedElements.push(actualElement);

  if (actualElement.$type === "ClassDeclaration") {
    actualElement.specializationEndurants.forEach((specializationItem) => {
      const specItem = specializationItem.ref;
      if (!specItem) {
        return;
      }
      let specElementNatures: OntologicalNature[] = [];
      if (isUltimateSortalOntoCategory(specItem.classElementType.ontologicalCategory)) {
        const sortalNature = tontoNatureUtils.getNatureFromUltimateSortal(specItem);
        if (sortalNature) {
          specElementNatures = [sortalNature];
        }
      } else {
        specElementNatures = parseOntologicalNatures(specItem.ontologicalNatures?.natures);
      }

      const newNatures = [...natures, ...specElementNatures];
      const parentNatures = getParentNatures(specItem, newNatures, genSets, verifiedElements);

      natures = [...natures, ...parentNatures];
    });

    let currentElementNatures: OntologicalNature[] = [];
    if (isUltimateSortalOntoCategory(actualElement.classElementType.ontologicalCategory)) {
      const sortalNature = tontoNatureUtils.getNatureFromUltimateSortal(actualElement);
      if (sortalNature) {
        currentElementNatures = [sortalNature];
      }
    } else {
      currentElementNatures = parseOntologicalNatures(actualElement.ontologicalNatures?.natures);
    }
    const genSetsWithElement: GeneralizationSet[] = getGensetsWhereSpecific(actualElement.name, genSets);
    let parentGenSetNatures: OntologicalNature[] = [];
    genSetsWithElement.forEach((genSet) => {
      parentGenSetNatures = getParentNatures(genSet, natures, genSets, verifiedElements);
    });
    return [...natures, ...currentElementNatures, ...parentGenSetNatures];
  } else if (actualElement.$type === "GeneralizationSet") {
    let parentNatures: OntologicalNature[] = [];
    if (actualElement.generalItem.ref?.$type === "ClassDeclaration") {
      parentNatures = getParentNatures(actualElement.generalItem.ref, natures, genSets, verifiedElements);
    }
    return [...natures, ...parentNatures];
  }
  return [];
};

function parseOntologicalNatures(natures?: ASTNature[]): OntologicalNature[] {
  if (!natures) {
    return [];
  }
  return natures.flatMap((nature) => tontoNatureUtils.getNatureFromAst(nature) || []);
}

export { getParentNatures };
