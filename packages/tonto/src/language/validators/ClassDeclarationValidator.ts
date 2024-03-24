/* eslint-disable max-len */
import { ValidationAcceptor } from "langium";
import { ClassDeclaration } from "../generated/ast.js";
import { tontoNatureUtils } from "../models/Natures.js";
import {
    OntologicalCategoryEnum,
    getOntologicalCategory,
    isUltimateSortalOntoCategory,
} from "../models/OntologicalCategory.js";
import {
    allowedStereotypeRestrictedToMatches,
    hasNonSortalStereotype,
    hasSortalStereotype,
    isAntiRigidStereotype,
    isRigidStereotype,
    isSemiRigidStereotype,
} from "../models/StereotypeUtils.js";
import { toQualifiedName } from "../references/tonto-name-provider.js";
import { checkUltimateSortalSpecializesUltimateSortalRecursive } from "../utils/CheckUltimateSortalSpecializesUltimateSortalRecursive.js";
import { checkNatureCompatibleRestrictedTo } from "../utils/checkNatureCompatibleRestrictedTo.js";
import { formPhrase } from "../utils/formPhrase.js";

export class ClassDeclarationValidator {
    /**
   * Check if the class declaration doesn't have a specific stereotype
   */
    checkClassWithoutStereotype(classDeclaration: ClassDeclaration, accept: ValidationAcceptor): void {
        if (classDeclaration.classElementType?.ontologicalCategory === OntologicalCategoryEnum.CLASS) {
            const natures = classDeclaration.ontologicalNatures?.natures;
            if (!natures) {
                accept("warning", "Consider using an annotation or a more specific class", {
                    node: classDeclaration,
                    property: "classElementType",
                });
            }
        }
    }

    /**
   * Verify if the class is an UltimateSortal and specializes another
   * UltimateSortal (stereotypes: kind, collective, quantity, relator, quality,
   * mode, intrinsicMode or extrinsicMode)
   */
    checkUltimateSortalSpecializeUltimateSortal(classDeclaration: ClassDeclaration, accept: ValidationAcceptor): void {
        if (!classDeclaration || !classDeclaration.classElementType) {
            return;
        }
        const ontologicalCategory = classDeclaration.classElementType?.ontologicalCategory;

        if (ontologicalCategory === null || ontologicalCategory === undefined) {
            return;
        }
        // Check if it is an UltimateSortal
        // 'kind' | 'collective' | 'quantity' | 'quality' | 'mode' | 'intrinsicMode' | 'extrinsicMode' | 'relator'
        if (
            isUltimateSortalOntoCategory(ontologicalCategory) ||
            ontologicalCategory === "intrinsicMode" ||
            ontologicalCategory === "extrinsicMode"
        ) {
            checkUltimateSortalSpecializesUltimateSortalRecursive(classDeclaration, accept);
        }
    }

    /**
   * Verify if it is a generalization between two classes. Verify if the general
   * class has an Anti rigid stereotype and the specific class has a Rigid or
   * Anti Rigid stereotype
   */
    checkRigidSpecializesAntiRigid(classDeclaration: ClassDeclaration, accept: ValidationAcceptor): void {
        if (!classDeclaration || !classDeclaration.classElementType) {
            return;
        }
        const ontologicalCategory = classDeclaration.classElementType?.ontologicalCategory;

        // Check if it is a rigid stereotype
        if (isRigidStereotype(ontologicalCategory) || isSemiRigidStereotype(ontologicalCategory)) {
            classDeclaration.specializationEndurants.forEach((specializationItem) => {
                const specDeclaration = specializationItem.ref as ClassDeclaration;
                if (!specDeclaration) {
                    return;
                }
                const specOntologicalCategory = specDeclaration.classElementType?.ontologicalCategory;

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
    checkDuplicatedReferenceNames(classDeclaration: ClassDeclaration, accept: ValidationAcceptor): void {
        const references = classDeclaration.references;

        const names: string[] = [];

        references.forEach((reference) => {
            if (!reference.name) {
                return;
            }
            const qualifiedName = toQualifiedName(classDeclaration, reference.name);
            const nameExists = names.find((name) => name === qualifiedName);
            if (nameExists) {
                accept("error", "Duplicated reference name", { node: reference });
            } else {
                names.push(qualifiedName);
            }
        });
    }

    /**
   * Verify if the class is not restricted with an incompatible Nature with this
   * class stereotype.
   */
    checkCompatibleNatures(classDeclaration: ClassDeclaration, accept: ValidationAcceptor): void {
        const ontologicalCategory = classDeclaration.classElementType?.ontologicalCategory;
        if (ontologicalCategory === OntologicalCategoryEnum.CLASS) {
            return;
        }
        const elementNatures = classDeclaration.ontologicalNatures?.natures;
        if (elementNatures) {
            const ontologicalCategoryEnum = getOntologicalCategory(ontologicalCategory);
            if (ontologicalCategoryEnum) {
                const incompatibleNatures = elementNatures.filter((nature) => {
                    const realNature = tontoNatureUtils.getNatureFromAst(nature);
                    const results = realNature.flatMap((nature) => {
                        const stereotypeMatches = allowedStereotypeRestrictedToMatches[ontologicalCategoryEnum];
                        const includesNature = !allowedStereotypeRestrictedToMatches[ontologicalCategoryEnum].includes(nature);
                        return stereotypeMatches && includesNature;
                    });
                    if (results.includes(true)) {
                        return true;
                    }
                    return false;
                });
                if (incompatibleNatures.length >= 1) {
                    const naturesString = formPhrase(incompatibleNatures);
                    accept(
                        "error",
                        `Incompatible stereotype and Nature restriction combination. Class ${classDeclaration.name} is incompatible with the following natures: ${naturesString}`,
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
   * Verify if the class is specializing a Nature permitted by its general class
   */
    checkSpecializationOfCorrectNature(classDeclaration: ClassDeclaration, accept: ValidationAcceptor): void {
        const specializations = classDeclaration.specializationEndurants;
        const sourceNatures = classDeclaration.ontologicalNatures?.natures;
        if (!sourceNatures) {
            return;
        }

        specializations.forEach((specialization) => {
            const natures = specialization.ref?.ontologicalNatures?.natures;
            if (natures) {
                let hasCompatibleNatures = false;
                for (const specificNature of natures) {
                    for (const generalNature of sourceNatures) {
                        const isCompatible = checkNatureCompatibleRestrictedTo(generalNature, specificNature);
                        if (isCompatible === true) {
                            hasCompatibleNatures = true;
                        }
                    }
                }
                if (hasCompatibleNatures === false) {
                    let naturesList: string = natures.reduce((nature: string, lastString: string) => {
                        return `${lastString}, ${nature}`;
                    }, "");
                    naturesList = naturesList.slice(0, naturesList.length - 2);
                    accept(
                        "error",
                        `This element cannot be of this type when its superclass has
             other nature restrictions. The allowed natures are: ${naturesList}`,
                        { node: classDeclaration }
                    );
                }
            }
        });
    }

    /**
   * Verify if the general class is a Sortal stereotype and the specific class
   * has a non-Sortal stereotype. This generalization is forbidden
   */
    checkGeneralizationSortality(classDeclaration: ClassDeclaration, accept: ValidationAcceptor) {
        const generalItems = classDeclaration.specializationEndurants;
        const isNonSortal = hasNonSortalStereotype(classDeclaration.classElementType?.ontologicalCategory);
        if (isNonSortal) {
            generalItems.forEach((general) => {
                const generalClass = general.ref as ClassDeclaration;
                if (hasSortalStereotype(generalClass.classElementType?.ontologicalCategory)) {
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
}
