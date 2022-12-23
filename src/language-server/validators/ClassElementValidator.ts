import { ValidationAcceptor } from "langium";
import { natureUtils } from "../models/Natures";
import { getOntologicalCategory, isSortalOntoCategory, OntologicalCategoryEnum } from "../models/OntologicalCategory";
import { allowedStereotypeRestrictedToMatches, hasNonSortalStereotype, hasSortalStereotype, isAntiRigidStereotype, isRigidStereotype, isSemiRigidStereotype } from "../models/StereotypeUtils";
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

    /**
     *  Verifica se a classe inicializa seu nome com Letra maiúscula
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
     * Verifica se é uma generalização entre duas classes. Verifica se a general
     * tem um estereótipo Anti rigido e a specific tem um estereótipo rígido
     * ou Anti rígido
     */
    checkRigidSpecializesAntiRigid(
        classDeclaration: ClassDeclaration,
        accept: ValidationAcceptor
    ): void {
        if (!classDeclaration || !classDeclaration.classElementType) {
            return;
        }
        const ontologicalCategory = classDeclaration.classElementType.ontologicalCategory;

        // Check if it is a rigid stereotype
        if (isRigidStereotype(ontologicalCategory) || isSemiRigidStereotype(ontologicalCategory)) {
            classDeclaration.specializationEndurants.forEach((specializationItem) => {
                const specDeclaration = specializationItem.ref as ClassDeclaration;
                if (!specDeclaration) {
                    return;
                }
                const specOntologicalCategory = specDeclaration.classElementType.ontologicalCategory;

                if (isAntiRigidStereotype(specOntologicalCategory)) {
                    // console.log("Error na referencia")
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
     * Verifica se existem nomes de referência duplicados dentro da classe
     */
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
        classDeclaration: ClassDeclaration,
        accept: ValidationAcceptor
    ): void {
        if (!classDeclaration || !classDeclaration.classElementType) {
            return;
        }
        const ontologicalCategory =  classDeclaration.classElementType.ontologicalCategory;

        if (ontologicalCategory === OntologicalCategoryEnum.CLASS) {
            return;
        }

        const elementNatures = classDeclaration.ontologicalNatures?.natures;

        if (elementNatures) {
            const ontologicalCategoryEnum = getOntologicalCategory(ontologicalCategory)
            if (ontologicalCategoryEnum) {
                const incompatibleNatures = elementNatures.filter(nature => {
                    const realNature = natureUtils.getNatureFromAst(nature)
                    if (realNature) {
                        const stereotypeMatches = allowedStereotypeRestrictedToMatches[ontologicalCategoryEnum]
                        const includesNature = allowedStereotypeRestrictedToMatches[ontologicalCategoryEnum].includes(realNature)
                        console.debug(stereotypeMatches, includesNature)
                        return stereotypeMatches && includesNature
                    }
                    return false
                })
                if (incompatibleNatures.length > 1) {
                    accept('error', `Incompatible stereotype and Nature restriction combination. Class ${classDeclaration.name} has its value for 'restrictedTo' incompatible with the stereotype`, {
                        node: classDeclaration,
                        property: "name"
                    })
                }
            }
        }
    }


    /**
     * Verifica se a classe restringe Natures que sua classe pai também restringe
     */
    checkSpecializationNatureRestrictions(
        classDeclaration: ClassDeclaration,
        accept: ValidationAcceptor
    ) {
        const elementNatures = classDeclaration.ontologicalNatures

        if (elementNatures) {
            elementNatures.natures.forEach((nature) => {
                let specializationDoesntExistsInParent = false;
                classDeclaration.specializationEndurants.forEach(
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
                        { node: classDeclaration, property: "ontologicalNatures" }
                    );
                }
            });
        }
    }

    /**
     * Verifica se a classe é do tipo que é permitido pelas Natures de sua classe
     * pai
     */
    checkSpecializationOfCorrectNature(
        classDeclaration: ClassDeclaration,
        accept: ValidationAcceptor
    ): void {
        const specializations = classDeclaration.specializationEndurants;
        const ontologicalCategory = classDeclaration.classElementType?.ontologicalCategory;

        specializations.forEach((specialization) => {
            let natures = specialization.ref?.ontologicalNatures?.natures;
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

    /**
     * Verifica se a classe é da categoria TYPE, e caso seja, se sua meta-propriedade
     * Powertype está definida
     */
    checkMissingIsPowertype(
        classDeclaration: ClassDeclaration,
        accept: ValidationAcceptor
    ): void {
        const ontologicalCategory = classDeclaration.classElementType.ontologicalCategory

        if (ontologicalCategory === OntologicalCategoryEnum.TYPE) {
            // Não tem definido a meta-propriedade Powertype
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

    /**
     * Verifica se a classe não possui um estereótipo definido
     */
    checkClassWithoutStereotype(
        classDeclaration: ClassDeclaration,
        accept: ValidationAcceptor
    ): void {
        if (classDeclaration.classElementType.ontologicalCategory === OntologicalCategoryEnum.CLASS) {
            accept(
                "hint",
                "Consider using an annotation or a more specific class",
                { node: classDeclaration, property: "classElementType" }
            );
        }
    }

    /**
     * Verifica se é uma generalização entre duas classes. Verifica se o general
     * possui um estereótipo Sortal e o specific possui um estereótipo não
     * sortal, se tiver, a generalização é proibida.
     */
    checkGeneralizationSortality(classDeclaration: ClassDeclaration, accept: ValidationAcceptor) {
        const generalItems = classDeclaration.specializationEndurants
        const isNonSortal = hasNonSortalStereotype(classDeclaration.classElementType.ontologicalCategory)
        if (isNonSortal) {
            generalItems.forEach(general => {
                const generalClass = general.ref as ClassDeclaration
                if (hasSortalStereotype(generalClass.classElementType.ontologicalCategory)) {
                    accept("error", `Prohibited generalization: non-sortal specializing a sortal. The non-sortal class ${classDeclaration.name} cannot specialize the sortal class ${generalClass.name}`,
                        {
                            node: classDeclaration,
                            property: "specializationEndurants"
                        })
                }
            })
        }
    }

    /**
     * Verifica se é uma generalização entre duas classes. Verifica se o general
     * e o specific possuem estereótipo definido. Verifica se o general ou
     * specific são datatype, e se o estereótipo de general e specific são
     * diferentes
     */
    checkGeneralizationDataType(classDeclaration: ClassDeclaration,
        accept: ValidationAcceptor) {
        const ontologicalCategory = classDeclaration.classElementType.ontologicalCategory

        if (ontologicalCategory === "datatype") {
            const specializationItems = classDeclaration.specializationEndurants
            specializationItems.forEach(item => {
                if (item.ref?.classElementType.ontologicalCategory === "datatype") {
                    accept("error", "Prohibited generalization: datatype specialization. A datatype can only be in generalization relation with other datatypes", {
                        node: classDeclaration,
                        property: "specializationEndurants"
                    })
                }
            })
        }
    }
}
