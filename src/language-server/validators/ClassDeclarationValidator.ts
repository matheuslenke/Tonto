import { ValidationAcceptor } from "langium";
import { ClassDeclaration } from "../generated/ast";
import { natureUtils } from "../models/Natures";
import {
  getOntologicalCategory,
  isSortalOntoCategory,
  isUltimateSortalOntoCategory,
  OntologicalCategoryEnum
} from "../models/OntologicalCategory";
import {
  allowedStereotypeRestrictedToMatches,
  hasNonSortalStereotype,
  hasSortalStereotype,
  isAntiRigidStereotype,
  isRigidStereotype,
  isSemiRigidStereotype
} from "../models/StereotypeUtils";
import { checkCircularSpecializationRecursive } from "../utils/CheckCircularSpecializationRecursive";
import { checkNatureCompatibleWithStereotype } from "../utils/checkNatureCompatibleWithStereotype";
import { checkSortalSpecializesUniqueUltimateSortalRecursive } from "../utils/CheckSortalSpecializesUniqueUltimateSortalRecursive";
import { checkUltimateSortalSpecializesUltimateSortalRecursive } from "../utils/CheckUltimateSortalSpecializesUltimateSortalRecursive";
import { formPhrase } from "../utils/formPhrase";
import { ErrorMessages } from "./../models/ErrorMessages";

export class ClassDeclarationValidator {
  /**
   * Check if the class declaration doesn't have a specific stereotype
   */
  checkClassWithoutStereotype(
    classDeclaration: ClassDeclaration,
    accept: ValidationAcceptor
  ): void {
    if (
      classDeclaration.classElementType.ontologicalCategory ===
      OntologicalCategoryEnum.CLASS
    ) {
      accept(
        "warning",
        "Consider using an annotation or a more specific class",
        {
          node: classDeclaration,
          property: "classElementType",
        }
      );
    }
  }

  /**
   * Verify if the class is an UltimateSortal and specializes another
   * UltimateSortal (stereotypes: kind, collective, quantity, relator, quality,
   * mode, intrinsicMode or extrinsicMode)
   */
  checkUltimateSortalSpecializeUltimateSortal(
    classDeclaration: ClassDeclaration,
    accept: ValidationAcceptor
  ): void {
    if (!classDeclaration || !classDeclaration.classElementType) {
      return;
    }
    const ontologicalCategory =
      classDeclaration.classElementType.ontologicalCategory;

    if (ontologicalCategory === null || ontologicalCategory === undefined) {
      return;
    }
    // Check if it is an UltimateSortal
    // 'kind' | 'collective' | 'quantity' | 'quality' | 'mode' | 'intrinsicMode' | 'extrinsicMode' | 'relator'
    if (
      ontologicalCategory === OntologicalCategoryEnum.KIND ||
      ontologicalCategory === OntologicalCategoryEnum.COLLECTIVE ||
      ontologicalCategory === OntologicalCategoryEnum.QUANTITY ||
      ontologicalCategory === OntologicalCategoryEnum.QUALITY ||
      ontologicalCategory === OntologicalCategoryEnum.RELATOR ||
      ontologicalCategory === OntologicalCategoryEnum.MODE ||
      ontologicalCategory === OntologicalCategoryEnum.INTRINSIC_MODE ||
      ontologicalCategory === OntologicalCategoryEnum.EXTRINSIC_MODE
    ) {
      checkUltimateSortalSpecializesUltimateSortalRecursive(
        classDeclaration,
        accept
      );
    }
  }

  /**
   * Verify if the class declaration is a sortal and it's not an Ultimate
   * Sortal. Verify if it does not specialize any Ultimate Sortal, and
   * also verifies if it specialize more than one Ultimate Sortal. If
   * it is not restricted to the Type nature, then it shows an error that
   * it needs to specialize an Ultimate Sortal
   */
  checkClassDeclarationShouldSpecializeUltimateSortal(
    classDeclaration: ClassDeclaration,
    accept: ValidationAcceptor
  ) {
    if (!classDeclaration || !classDeclaration.classElementType) {
      return;
    }
    const ontologicalCategory =
      classDeclaration.classElementType.ontologicalCategory;

    // Check if it has a defined stereotype
    if (
      !ontologicalCategory ||
      ontologicalCategory === OntologicalCategoryEnum.CLASS
    ) {
      return;
    }

    // Check if it is a Sortal but not an Ultimate Sortal
    if (
      isSortalOntoCategory(ontologicalCategory) &&
      !isUltimateSortalOntoCategory(
        classDeclaration.classElementType.ontologicalCategory
      )
    ) {
      const totalUltimateSortalSpecializations =
        checkSortalSpecializesUniqueUltimateSortalRecursive(
          classDeclaration,
          0
        );
      if (totalUltimateSortalSpecializations === 0) {
        const natures = classDeclaration.ontologicalNatures?.natures;
        if (natures) {
          const isRestrictedToType = natures.find(
            (nature) => nature === "types"
          );
          if (isRestrictedToType === undefined) {
            accept(
              "error",
              ErrorMessages.sortalSpecializesUniqueUltimateSortal,
              {
                node: classDeclaration,
                property: "name",
              }
            );
          }
        } else {
          accept("error", ErrorMessages.sortalSpecializeNoUltimateSortal, {
            node: classDeclaration,
            property: "name",
          });
        }
      }
      if (totalUltimateSortalSpecializations > 1) {
        accept("error", ErrorMessages.sortalSpecializesUniqueUltimateSortal, {
          node: classDeclaration,
          property: "specializationEndurants",
        });
      }
    }
  }

  /**
   *  Verify if the class starts with a Capital letter
   */
  checkClassElementStartsWithCapital(
    classDeclaration: ClassDeclaration,
    accept: ValidationAcceptor
  ): void {
    if (classDeclaration.name) {
      const firstChar = classDeclaration.name.substring(0, 1);
      if (firstChar.toUpperCase() !== firstChar) {
        accept("hint", "Class name should start with a capital.", {
          node: classDeclaration,
          property: "name",
        });
      }
    }
  }

  /**
   * Verify if it is a generalization between two classes. Verify if the general
   * class has an Anti rigid stereotype and the specific class has a Rigid or
   * Anti Rigid stereotype
   */
  checkRigidSpecializesAntiRigid(
    classDeclaration: ClassDeclaration,
    accept: ValidationAcceptor
  ): void {
    if (!classDeclaration || !classDeclaration.classElementType) {
      return;
    }
    const ontologicalCategory =
      classDeclaration.classElementType.ontologicalCategory;

    // Check if it is a rigid stereotype
    if (
      isRigidStereotype(ontologicalCategory) ||
      isSemiRigidStereotype(ontologicalCategory)
    ) {
      classDeclaration.specializationEndurants.forEach((specializationItem) => {
        const specDeclaration = specializationItem.ref as ClassDeclaration;
        if (!specDeclaration) {
          return;
        }
        const specOntologicalCategory =
          specDeclaration.classElementType.ontologicalCategory;

        if (isAntiRigidStereotype(specOntologicalCategory)) {
          accept(
            "error",
            `Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class ${classDeclaration.name} cannot specialize the anti-rigid class ${specDeclaration.name}`,
            { node: classDeclaration }
          );
        }
      });
    }
  }

  /**
   * Verify if there are duplicated declaration names
   */
  checkDuplicatedReferenceNames(
    classElement: ClassDeclaration,
    accept: ValidationAcceptor
  ): void {
    const references = classElement.references;

    const names: string[] = [];

    references.forEach((reference) => {
      const nameExists = names.find((name) => name === reference.name);
      if (nameExists) {
        accept("error", "Duplicated reference name", { node: reference });
      } else {
        if (reference.name) {
          names.push(reference.name);
        }
      }
    });
  }

  /**
   * Verify if the class is not restricted with an incompatible Nature with this
   * class stereotype.
   */
  checkCompatibleNatures(
    classDeclaration: ClassDeclaration,
    accept: ValidationAcceptor
  ): void {
    if (!classDeclaration || !classDeclaration.classElementType) {
      return;
    }
    const ontologicalCategory =
      classDeclaration.classElementType.ontologicalCategory;

    if (ontologicalCategory === OntologicalCategoryEnum.CLASS) {
      return;
    }

    const elementNatures = classDeclaration.ontologicalNatures?.natures;

    if (elementNatures) {
      const ontologicalCategoryEnum =
        getOntologicalCategory(ontologicalCategory);
      if (ontologicalCategoryEnum) {
        const incompatibleNatures = elementNatures.filter((nature) => {
          const realNature = natureUtils.getNatureFromAst(nature);
          if (realNature) {
            const stereotypeMatches =
              allowedStereotypeRestrictedToMatches[ontologicalCategoryEnum];
            const includesNature =
              !allowedStereotypeRestrictedToMatches[
                ontologicalCategoryEnum
              ].includes(realNature);
            return stereotypeMatches && includesNature;
          }
          return false;
        });
        if (incompatibleNatures.length >= 1) {
          const naturesString = formPhrase(incompatibleNatures);

          accept(
            "error",
            `Incompatible stereotype and Nature restriction combination. Class ${classDeclaration.name} has its value for 'restrictedTo' incompatible with the following natures: ${naturesString}`,
            {
              node: classDeclaration,
              property: "ontologicalNatures",
            }
          );
        }
      }
    }
  }

  /**
   * Verify if the class restricts to Natures that is general class also
   * restricts
   */
  checkSpecializationNatureRestrictions(
    classDeclaration: ClassDeclaration,
    accept: ValidationAcceptor
  ) {
    const elementNatures = classDeclaration.ontologicalNatures;

    if (elementNatures) {
      elementNatures.natures.forEach((nature) => {
        let specializationDoesntExistsInParent = false;
        classDeclaration.specializationEndurants.forEach(
          (specializationEndurant) => {
            const specializationNatures =
              specializationEndurant.ref?.ontologicalNatures;
            const natureExists = specializationNatures?.natures.find(
              (specializationNature) => {
                return specializationNature === nature;
              }
            );
            if (natureExists === undefined) {
              specializationDoesntExistsInParent = true;
            }
          }
        );

        if (specializationDoesntExistsInParent) {
          accept(
            "error",
            "This element cannot be restricted to Natures that its superclass is not restricted",
            { node: classDeclaration, property: "ontologicalNatures" }
          );
        }
      });
    }
  }

  /**
   * Verify if the class is specializing a Nature permitted by its general class
   */
  checkSpecializationOfCorrectNature(
    classDeclaration: ClassDeclaration,
    accept: ValidationAcceptor
  ): void {
    const specializations = classDeclaration.specializationEndurants;
    const ontologicalCategory =
      classDeclaration.classElementType?.ontologicalCategory;

    specializations.forEach((specialization) => {
      const natures = specialization.ref?.ontologicalNatures?.natures;
      if (natures) {
        let hasCompatibleNatures = false;
        natures.forEach((nature) => {
          const isCompatible = checkNatureCompatibleWithStereotype(
            nature,
            ontologicalCategory
          );
          if (isCompatible === true) {
            hasCompatibleNatures = true;
          }
        });
        if (hasCompatibleNatures === false) {
          let naturesList = natures.reduce((nature, lastString) => {
            return `${lastString}, ${nature}`;
          }, "");
          naturesList = naturesList.slice(0, naturesList.length - 2);
          accept(
            "error",
            `This element cannot be of this type when its superclass has other nature restrictions. The allowed natures are: ${naturesList}`,
            { node: classDeclaration }
          );
        }
      }
    });
  }

  checkNaturesOnlyOnNonSortals(
    classElement: ClassDeclaration,
    _: ValidationAcceptor
  ): void {
    const ElementNatures = classElement.ontologicalNatures;
    if (ElementNatures) {
      // if (
      //     hasSortalStereotype(
      //         classElement.classElementType?.ontologicalCategory
      //     )
      // ) {
      //     accept("error", "Only non-sortal types can specialize natures", {
      //         node: classElement,
      //         property: "ontologicalNatures",
      //     });
      // }
    }
  }

  /**
   * Verifica se a classe é da categoria TYPE, e caso seja, se sua meta-propriedade
   * Powertype está definida
   */
  // TODO: Not implemented
  // checkMissingIsPowertype(): // classDeclaration: ClassDeclaration,
  //   // accept: ValidationAcceptor
  //   void { }

  /*
   * Checks if an Element has a ciclic specialization
   */
  checkCircularSpecialization(
    classElement: ClassDeclaration,
    accept: ValidationAcceptor
  ): void {
    classElement.specializationEndurants.forEach((specializationItem) => {
      const specItem = specializationItem.ref;
      if (!specItem) {
        return;
      }
      checkCircularSpecializationRecursive(specItem, [], accept);
    });
  }

  /**
   * Verify if the general class is a Sortal stereotype and the specific class
   * has a non-Sortal stereotype. This generalization is forbidden
   */
  checkGeneralizationSortality(
    classDeclaration: ClassDeclaration,
    accept: ValidationAcceptor
  ) {
    const generalItems = classDeclaration.specializationEndurants;
    const isNonSortal = hasNonSortalStereotype(
      classDeclaration.classElementType.ontologicalCategory
    );
    if (isNonSortal) {
      generalItems.forEach((general) => {
        const generalClass = general.ref as ClassDeclaration;
        if (
          hasSortalStereotype(generalClass.classElementType.ontologicalCategory)
        ) {
          accept(
            "error",
            `Prohibited generalization: non-sortal specializing a sortal. The non-sortal class ${classDeclaration.name} cannot specialize the sortal class ${generalClass.name}`,
            {
              node: classDeclaration,
              property: "specializationEndurants",
            }
          );
        }
      });
    }
  }

  /**
   * Verifica se é uma generalização entre duas classes. Verifica se o general
   * e o specific possuem estereótipo definido. Verifica se o general ou
   * specific são datatype, e se o estereótipo de general e specific são
   * diferentes
   */
  checkGeneralizationDataType(
    classDeclaration: ClassDeclaration,
    accept: ValidationAcceptor
  ) {
    const ontologicalCategory =
      classDeclaration.classElementType.ontologicalCategory;

    if (ontologicalCategory === OntologicalCategoryEnum.DATATYPE) {
      const specializationItems = classDeclaration.specializationEndurants;
      specializationItems.forEach((item) => {
        if (item.ref?.classElementType.ontologicalCategory === "datatype") {
          accept(
            "error",
            "Prohibited generalization: datatype specialization. A datatype can only be in generalization relation with other datatypes",
            {
              node: classDeclaration,
              property: "specializationEndurants",
            }
          );
        }
      });
    }
  }
}
