import { ValidationAcceptor } from "langium";
import { ClassDeclaration, GeneralizationSet } from "../generated/ast";
import { hasNonSortalStereotype, hasSortalStereotype, isAntiRigidStereotype, isRigidStereotype, isSemiRigidStereotype } from "../models/StereotypeUtils";

export class GeneralizationValidator {

  /**
     * Verifica se o tipo de elemento do general (classe ou relation) é diferente do específico, dando erro caso seja.
     */
  checkGeneralizationSetConsistency(genSet: GeneralizationSet, accept: ValidationAcceptor): void {
    const generalItem = genSet.generalItem.ref
    const specificsItems = genSet.specificItems

    if (generalItem === undefined) {
      return
    }

    if (generalItem.$type ===  "ClassDeclaration") {
      specificsItems.forEach(specific => {
        if (specific.ref?.$type === "ElementRelation") {
          accept("error", "Prohibited generalization: Generalizations must exclusively involve classes or relations, never a combination.", {
            node: genSet
          })
        }
      })
    } else {
      specificsItems.forEach(specific => {
        if (specific.ref?.$type === "ClassDeclaration") {
          accept("error", "Prohibited generalization: Generalizations must exclusively involve classes or relations, never a combination.", {
            node: genSet
          })
        }
      })
    }
  }

  /**
     * Verifica se a generalização é circular
     */
  checkCircularGeneralization(genSet: GeneralizationSet, accept: ValidationAcceptor): void {
    const generalItem = genSet.generalItem.ref
    const specificsItems = genSet.specificItems

    if (generalItem === undefined) {
      return
    }

    specificsItems.forEach(specific => {
      if (specific.ref?.name === generalItem.name) {
        accept("error", "Prohibited generalization: circular generalization. Generalizations must be defined between two distinct classes/relations", {
          node: genSet
        })
      }
    })
  }

  /**
     * Verifica se é uma generalização entre duas classes. Verifica se o general
     * possui um estereótipo Sortal e o specific possui um estereótipo não
     * sortal, se tiver, a generalização é proibida.
     */
  checkGeneralizationSortality(genSet: GeneralizationSet, accept: ValidationAcceptor) {
    const generalItem = genSet.generalItem.ref
    const specificsItems = genSet.specificItems

    if (generalItem === undefined) {
      return
    }
    specificsItems.forEach(specific => {
      if (specific.ref?.$type === "ElementRelation") {
        return
      }
    })

    if (generalItem.$type ===  "ClassDeclaration") {
      if (hasSortalStereotype(generalItem.classElementType.ontologicalCategory)) {
        specificsItems.forEach(specific => {
          const specificClass = specific.ref as ClassDeclaration
          if (hasNonSortalStereotype(specificClass.classElementType.ontologicalCategory)) {
            accept("error", `Prohibited generalization: non-sortal specializing a sortal. The non-sortal class ${specificClass.name} cannot specialize the sortal class ${generalItem.name}`, {
              node: genSet,
              property: "generalItem"
            })
            accept("error", `Prohibited generalization: non-sortal specializing a sortal. The non-sortal class ${specificClass.name} cannot specialize the sortal class ${generalItem.name}`, {
              node: genSet,
              property: "specificItems"
            })
          }
        })
      }
    }
  }

  /**
     * Verifica se é uma generalização entre duas classes. Verifica se a general
     * tem um estereótipo Anti rigido e a specific tem um estereótipo rígido
     * ou Anti rígido
     */
  checkRigidSpecializesAntiRigid(
    genSet: GeneralizationSet,
    accept: ValidationAcceptor
  ): void {
    const generalItem = genSet.generalItem.ref
    const specificItems = genSet.specificItems

    if(generalItem === undefined ) {
      return
    }
    if (generalItem.$type === "ElementRelation") {
      return
    }

    const ontologicalCategory = generalItem.classElementType.ontologicalCategory

    // Check if it is a anti-rigid stereotype
    if (isAntiRigidStereotype(ontologicalCategory)) {
      specificItems.forEach((specializationItem) => {
        const refElement = specializationItem.ref as ClassDeclaration;
        if (!refElement || !refElement.classElementType) {
          return;
        }
        const refOntologicalCategory = refElement.classElementType.ontologicalCategory;

        if (isRigidStereotype(refOntologicalCategory) || isSemiRigidStereotype(refOntologicalCategory)) {
          accept(
            "error",
            `Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class ${refElement.name} cannot specialize the anti-rigid class ${generalItem.name}`,
            {
              node: genSet,
              property: "generalItem"
            }
          );
          accept(
            "error",
            `Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class ${refElement.name} cannot specialize the anti-rigid class ${generalItem.name}`,
            {
              node: genSet,
              property: "specificItems"
            }
          );
        }
      });
    }
  }

  /**
     * Verifica se é uma generalização entre duas classes. Verifica se a general
     * tem um estereótipo Anti rigido e a specific tem um estereótipo rígido
     * ou Anti rígido
     */
  checkGeneralizationDataType(
    genSet: GeneralizationSet,
    accept: ValidationAcceptor
  ): void {
    const generalItem = genSet.generalItem.ref
    const specificItems = genSet.specificItems

    if(generalItem === undefined ) {
      return
    }
    if (generalItem.$type === "ElementRelation") {
      return
    }

    const ontologicalCategory = generalItem.classElementType.ontologicalCategory

    // Check if it is a anti-rigid stereotype
    if (ontologicalCategory === "datatype") {
      specificItems.forEach((specializationItem) => {
        const refElement = specializationItem.ref as ClassDeclaration;
        if (!refElement || !refElement.classElementType) {
          return;
        }
        const refOntologicalCategory = refElement.classElementType.ontologicalCategory;

        if (refOntologicalCategory !== "datatype") {
          accept(
            "error",
            `Prohibited generalization: datatype specialization. A datatype can only be in generalization relation with other datatypes`,
            {
              node: genSet,
              property: "generalItem"
            }
          );
          accept(
            "error",
            `Prohibited generalization: datatype specialization. A datatype can only be in generalization relation with other datatypes`,
            {
              node: genSet,
              property: "specificItems"
            }
          );
        }
      });
    }
  }
}