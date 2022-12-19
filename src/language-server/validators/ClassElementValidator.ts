import { ValidationAcceptor } from "langium";
import { isSortalOntoCategory, OntologicalCategoryEnum } from "../models/OntologicalCategory";
import { checkCircularSpecializationRecursive } from "../utils/CheckCircularSpecializationRecursive";
import { checkNatureCompatibleWithStereotype } from "../utils/checkNatureCompatibleWithStereotype";
import { checkSortalSpecializesUniqueUltimateSortalRecursive, validateSortalSpecializesUniqueUltimateSortalRecursive } from "../utils/CheckSortalSpecializesUniqueUltimateSortalRecursive";
import { checkUltimateSortalSpecializesUltimateSortalRecursive } from "../utils/CheckUltimateSortalSpecializesUltimateSortalRecursive";
import { getStereotypeIsSortal } from "../utils/getStereotypeIsSortal";
import { ClassDeclaration } from "./../generated/ast";

export class ClassElementValidator {
    /**
     * Verifica se a classe não é um UltimateSortal e especializa mais do que um
     * UltimateSortal
     */
    checkSortalSpecializeUniqueUltimateSortal(
        classElement: ClassDeclaration,
        accept: ValidationAcceptor
    ): void {
        if (!classElement || !classElement.classElementType) {
            return;
        }
        const ontologicalCategory = classElement.classElementType.ontologicalCategory;

        if (ontologicalCategory === null || ontologicalCategory === undefined) {
            return;
        }
        // Check if it is not an UltimateSortal
        if (
            !(ontologicalCategory === OntologicalCategoryEnum.KIND ||
            ontologicalCategory === OntologicalCategoryEnum.COLLECTIVE ||
            ontologicalCategory === OntologicalCategoryEnum.QUANTITY ||
            ontologicalCategory === OntologicalCategoryEnum.QUALITY ||
            ontologicalCategory === OntologicalCategoryEnum.RELATOR ||
            ontologicalCategory === OntologicalCategoryEnum.MODE ||
            ontologicalCategory === OntologicalCategoryEnum.EXTRINSIC_MODE ||
            ontologicalCategory === OntologicalCategoryEnum.INTRINSIC_MODE
            )
        ) {
            validateSortalSpecializesUniqueUltimateSortalRecursive(
                classElement,
                [],
                0,
                accept
            );
        }
    }

    /**
     * Verifica se a classe é um UltimateSortal e especializa outro UltimateSortal
     */
    checkUltimateSortalSpecializeUltimateSortal(
        classElement: ClassDeclaration,
        accept: ValidationAcceptor
    ): void {
        if (!classElement || !classElement.classElementType) {
            return;
        }
        const ontologicalCategory = classElement.classElementType.ontologicalCategory;

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
                classElement,
                accept
            );
        }
    }

    /**
     * Verifica se a classe é um Sortal que não é um ultimate sortal,
     * se não especializa nenhum ultimate sortal, e verifica se a classe não é
     * restrita à Natura Type. Caso seja, retorna que todo sortal precisa
     * especializar um único UltimateSortal e não pode especializar nenhum
     */
    checkClassDeclarationShouldSpecializeUltimateSortal(
        classDeclaration: ClassDeclaration,
        accept: ValidationAcceptor
    ) {
        if (!classDeclaration || !classDeclaration.classElementType) {
            return;
        }
        const ontologicalCategory = classDeclaration.classElementType.ontologicalCategory;

        if (ontologicalCategory === null || ontologicalCategory === undefined) {
            return;
        }
        // Check if it is a Sortal
        if (!isSortalOntoCategory(ontologicalCategory)) {
            return
        }

        // Check if it is not an UltimateSortal
        if (
            !(ontologicalCategory === OntologicalCategoryEnum.KIND ||
            ontologicalCategory === OntologicalCategoryEnum.COLLECTIVE ||
            ontologicalCategory === OntologicalCategoryEnum.QUANTITY ||
            ontologicalCategory === OntologicalCategoryEnum.QUALITY ||
            ontologicalCategory === OntologicalCategoryEnum.RELATOR ||
            ontologicalCategory === OntologicalCategoryEnum.MODE ||
            ontologicalCategory === OntologicalCategoryEnum.EXTRINSIC_MODE ||
            ontologicalCategory === OntologicalCategoryEnum.INTRINSIC_MODE
            )
            && ontologicalCategory !== OntologicalCategoryEnum.CLASS
        ) {
            const totalUltimateSortalSpecializations = checkSortalSpecializesUniqueUltimateSortalRecursive(
                classDeclaration,
                [],
                0
            );
            if (totalUltimateSortalSpecializations === 0) {
                const natures = classDeclaration.ontologicalNatures?.natures
                if (natures) {
                    const isRestrictedToType = natures.find(nature => nature === "types")
                    if (isRestrictedToType === undefined) {
                        accept("error", `Every sortal class must specialize a unique ultimate sortal. The class ${classDeclaration.name} must specialize (directly or indirectly) a unique class decorated as one of the following: kind, collective, quantity, relator, quality, mode, intrinsicMode, extrinsicMode`, {
                            node: classDeclaration,
                            property: "name"
                        })
                    }
                } else {
                    accept("error", `Every sortal class must specialize a unique ultimate sortal. The class ${classDeclaration.name} must specialize (directly or indirectly) a unique class decorated as one of the following: kind, collective, quantity, relator, quality, mode, intrinsicMode, extrinsicMode`, {
                        node: classDeclaration,
                        property: "name"
                    })
                }
            }
        }
    }

    checkClassElementStartsWithCapital(
        classElement: ClassDeclaration,
        accept: ValidationAcceptor
    ): void {
        if (classElement.name) {
            const firstChar = classElement.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept("warning", "Class name should start with a capital.", {
                    node: classElement,
                    property: "name",
                });
            }
        }
    }

    /**
     * Checks if a Rigid stereotype specializes a anti-rigid stereotype
     */
    checkRigidSpecializesAntiRigid(
        classElement: ClassDeclaration,
        accept: ValidationAcceptor
    ): void {
        if (!classElement || !classElement.classElementType) {
            return;
        }
        const endurantType = classElement.classElementType.ontologicalCategory;

        if (endurantType === null || endurantType === undefined) {
            return;
        }

        // Check if it is a rigid stereotype
        if (
            endurantType === OntologicalCategoryEnum.KIND ||
      endurantType === OntologicalCategoryEnum.SUBKIND ||
      endurantType === OntologicalCategoryEnum.COLLECTIVE ||
      endurantType === OntologicalCategoryEnum.CATEGORY
        ) {
            classElement.specializationEndurants.forEach((specializationItem) => {
                const refElement = specializationItem.ref?.$cstNode
                    ?.element as ClassDeclaration;
                if (!refElement || !refElement.classElementType) {
                    return;
                }
                const refType = refElement.classElementType.ontologicalCategory;

                if (
                    refType === OntologicalCategoryEnum.PHASE ||
          refType === OntologicalCategoryEnum.ROLE ||
          refType === OntologicalCategoryEnum.PHASE_MIXIN ||
          refType === OntologicalCategoryEnum.ROLE_MIXIN
                ) {
                    // console.log("Error na referencia")
                    accept(
                        "warning",
                        `Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class ${classElement.name} cannot specialize the anti-rigid class ${refElement.name}`,
                        { node: classElement }
                    );
                }
            });
        }
    }

    checkDuplicatedReferenceNames(
        classElement: ClassDeclaration,
        accept: ValidationAcceptor
    ): void {
        const references = classElement.references;

        let names: string[] = [];

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
     * Verifica se a classe não está restrita à alguma Nature incompatível com o
     * estereótipo da classe. Checar o array allowedStereotypeRestrictedToMatches
     * para ver as restrições
     */
    checkCompatibleNatures(
        classElement: ClassDeclaration,
        accept: ValidationAcceptor
    ): void {
        const elementNatures = classElement.ontologicalNatures;

        if (elementNatures) {
            elementNatures.natures.forEach((nature) => {
                let specializationDoesntExistsInParent = false;
                classElement.specializationEndurants.forEach(
                    (specializationEndurant) => {
                        let specializationNatures =
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
                        { node: classElement, property: "ontologicalNatures" }
                    );
                }
            });
        }
    }

    checkSpecializationOfCorrectNature(
        classElement: ClassDeclaration,
        accept: ValidationAcceptor
    ): void {
        const specializations = classElement.specializationEndurants;
        const stereotype = classElement.classElementType?.ontologicalCategory;

        specializations.forEach((specialization) => {
            let natures = specialization.ref?.ontologicalNatures?.natures;
            if (natures) {
                let hasCompatibleNatures = false;
                natures.forEach((nature) => {
                    const isCompatible = checkNatureCompatibleWithStereotype(
                        nature,
                        stereotype
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
                        { node: classElement }
                    );
                }
            }
        });
    }

    checkNaturesOnlyOnNonSortals(
        classElement: ClassDeclaration,
        accept: ValidationAcceptor
    ): void {
        const ElementNatures = classElement.ontologicalNatures;
        if (ElementNatures) {
            if (
                getStereotypeIsSortal(
                    classElement.classElementType?.ontologicalCategory
                )
            ) {
                accept("error", "Only non-sortal types can specialize natures", {
                    node: classElement,
                    property: "ontologicalNatures",
                });
            }
        }
    }

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

    checkClassWithoutStereotype(
        classDeclaration: ClassDeclaration,
        accept: ValidationAcceptor
    ): void {
        if (classDeclaration.classElementType.ontologicalCategory === OntologicalCategoryEnum.CLASS) {
            accept(
                "warning",
                "Consider using an annotation or a more specific class",
                { node: classDeclaration, property: "classElementType" }
            );
        }
    }
}
