
import { ValidationAcceptor } from "langium";
import { OntologicalNature } from "ontouml-js";
import { ClassDeclaration, ContextModule, GeneralizationSet } from "../generated/ast.js";
import { ErrorMessages } from "../models/ErrorMessages.js";
import { tontoNatureUtils } from "../models/Natures.js";
import {
    isBaseSortalOntoCategory,
    isSortalOntoCategory,
    isUltimateSortalOntoCategory,
} from "../models/OntologicalCategory.js";
import { checkCircularSpecializationRecursiveWithGenset } from "../utils/CheckCircularSpecializationRecursive.js";
import { checkSortalSpecializesUniqueUltimateSortalRecursive } from "../utils/CheckSortalSpecializesUniqueUltimateSortalRecursive.js";
import { compareArrays } from "../utils/compareArrays.js";
import { formPhrase } from "../utils/formPhrase.js";
import { getParentNatures } from "../utils/getParentNatures.js";

export class ContextModuleValidator {
    checkContextModuleStartsWithCapital(contextModule: ContextModule, accept: ValidationAcceptor): void {
        if (contextModule.name) {
            const firstChar = contextModule.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept("warning", "Module name should start with a capital.", {
                    node: contextModule,
                    property: "name",
                });
            }
        }
    }

    checkDuplicatedClassName(contextModule: ContextModule, accept: ValidationAcceptor): void {
        const elements = contextModule.declarations;
        const names: string[] = [];

        elements.forEach((declaration) => {
            if (declaration.$type === "ClassDeclaration") {
                const classElement = declaration as ClassDeclaration;
                const nameExists = names.find((name) => name === classElement.name);
                const refName = classElement.name;

                if (nameExists) {
                    accept("error", "Duplicated class declaration", {
                        node: classElement,
                        property: "name",
                    });
                } else if (refName !== undefined) {
                    names.push(classElement.name!);
                }
            }
        });
    }

    /**
   * Checks if a ClassDeclaration has a ciclic specialization considering also
   * considering generalizationSets
   */
    checkCircularSpecialization(contextModule: ContextModule, accept: ValidationAcceptor): void {
        const genSets = contextModule.declarations.filter((declaration) => {
            return declaration.$type === "GeneralizationSet";
        }) as GeneralizationSet[];

        const declaredClasses: ClassDeclaration[] = contextModule.declarations.filter((declaration) => {
            return declaration.$type === "ClassDeclaration";
        }) as ClassDeclaration[];

        declaredClasses.forEach((declaredClass) => {
            checkCircularSpecializationRecursiveWithGenset(declaredClass, [], genSets, accept);
        });
        genSets.forEach((genSet) => {
            checkCircularSpecializationRecursiveWithGenset(genSet, [], genSets, accept);
        });
    }

    /**
   * Verify if the class declaration is a sortal and it's not an Ultimate
   * Sortal. Verify if it does not specialize any Ultimate Sortal, and
   * also verifies if it specialize more than one Ultimate Sortal. If
   * it is not restricted to the Type nature, then it shows an error that
   * it needs to specialize an Ultimate Sortal
   */
    checkClassDeclarationShouldSpecializeUltimateSortal(contextModule: ContextModule, accept: ValidationAcceptor): void {
        const genSets = contextModule.declarations.filter((declaration) => {
            return declaration.$type === "GeneralizationSet";
        }) as GeneralizationSet[];

        const declaredClasses: ClassDeclaration[] = contextModule.declarations.filter((declaration) => {
            return declaration.$type === "ClassDeclaration";
        }) as ClassDeclaration[];

        declaredClasses.forEach((declaredClass) => {
            const ontologicalCategory = declaredClass?.classElementType?.ontologicalCategory;
            if (!ontologicalCategory) {
                return;
            }
            // Check if it is a Sortal but not an Ultimate Sortal
            if (isSortalOntoCategory(ontologicalCategory) && !isUltimateSortalOntoCategory(ontologicalCategory)) {
                const totalUltimateSortalSpecializations = checkSortalSpecializesUniqueUltimateSortalRecursive(
                    declaredClass,
                    genSets,
                    accept,
                    0
                );
                if (totalUltimateSortalSpecializations === 0) {
                    const natures = declaredClass.ontologicalNatures?.natures;
                    if (natures) {
                        const isRestrictedToType = natures.find((nature) => nature === "types");
                        if (isRestrictedToType === undefined) {
                            accept("error", ErrorMessages.sortalSpecializesUniqueUltimateSortal, {
                                node: declaredClass,
                                property: "name",
                            });
                        }
                    } else {
                        accept("error", ErrorMessages.sortalSpecializeNoUltimateSortal, {
                            node: declaredClass,
                            property: "name",
                        });
                    }
                }
                if (totalUltimateSortalSpecializations > 1) {
                    accept("error", ErrorMessages.sortalSpecializesUniqueUltimateSortal, {
                        node: declaredClass,
                        property: "name",
                    });
                }
            }
        });
    }

    /**
   * Validate if a element have the correct nature based on specialization.
   * @param contextModule Actual ContextModule
   * @param accept Error creator helper
   */
    checkCompatibleNaturesOfBaseSortals(contextModule: ContextModule, accept: ValidationAcceptor): void {
        const genSets = contextModule.declarations.filter((declaration) => {
            return declaration.$type === "GeneralizationSet";
        }) as GeneralizationSet[];

        const declaredClasses: ClassDeclaration[] = contextModule.declarations.filter((declaration) => {
            return declaration.$type === "ClassDeclaration";
        }) as ClassDeclaration[];

        declaredClasses.forEach((classDeclaration) => {
            if (isBaseSortalOntoCategory(classDeclaration.classElementType.ontologicalCategory)) {
                const parentNatures = getParentNatures(classDeclaration, [], genSets);
                if (
                    parentNatures.length === 0 &&
                    (!classDeclaration.ontologicalNatures || classDeclaration.ontologicalNatures?.natures.length === 0)
                ) {
                    accept(
                        "error",
                        "This class must specify the ontological nature of its instances. Specify a Nature or specialize an Ultimate Sortal that provides a nature",
                        {
                            node: classDeclaration,
                            property: "name",
                        }
                    );
                }
            }
        });
    }

    /**
   * Verify if the class restricts to Natures that is general class also
   * restricts
   */
    checkSpecializationNatureRestrictions(contextModule: ContextModule, accept: ValidationAcceptor) {
        const genSets = contextModule.declarations.filter((declaration) => {
            return declaration.$type === "GeneralizationSet";
        }) as GeneralizationSet[];

        const declaredClasses: ClassDeclaration[] = contextModule.declarations.filter((declaration) => {
            return declaration.$type === "ClassDeclaration";
        }) as ClassDeclaration[];

        declaredClasses.forEach((classDeclaration) => {
            let parentNatures: OntologicalNature[] = [];
            parentNatures = classDeclaration.specializationEndurants.flatMap((specItem) => {
                if (!specItem.ref) {
                    return [];
                }
                const natures = getParentNatures(specItem.ref, [], genSets);
                return natures;
            });
            if (classDeclaration.ontologicalNatures) {
                classDeclaration.ontologicalNatures.natures.forEach((nature) => {
                    /**
           * Check if parentNatures are incompatible with defined natures
           */
                    const actualNatures = tontoNatureUtils.getNatureFromAst(nature);
                    actualNatures.forEach((actualNature) => {
                        if (parentNatures.length > 0 && !parentNatures.includes(actualNature)) {
                            accept(
                                "error",
                                `Incompatible nature restrictions. Parent has nature ${formPhrase(
                                    parentNatures
                                )} while this class has natures: ${actualNature}`,
                                {
                                    node: classDeclaration,
                                    property: "ontologicalNatures",
                                }
                            );
                        }
                    });
                });
            }
        });
    }

    checkRedundantNatures(contextModule: ContextModule, accept: ValidationAcceptor) {
        const genSets = contextModule.declarations.filter((declaration) => {
            return declaration.$type === "GeneralizationSet";
        }) as GeneralizationSet[];

        const declaredClasses: ClassDeclaration[] = contextModule.declarations.filter((declaration) => {
            return declaration.$type === "ClassDeclaration";
        }) as ClassDeclaration[];

        declaredClasses.forEach((classDeclaration) => {
            if (classDeclaration.ontologicalNatures) {
                let parentNatures: OntologicalNature[] = [];
                parentNatures = classDeclaration.specializationEndurants.flatMap((specItem) => {
                    if (!specItem.ref) {
                        return [];
                    }
                    const natures = getParentNatures(specItem.ref, [], genSets);
                    return natures;
                });
                const ultimateSortalNature = tontoNatureUtils.getNatureFromUltimateSortal(classDeclaration);
                if (ultimateSortalNature) {
                    parentNatures.push(ultimateSortalNature);
                }
                const parsedNatures = classDeclaration.ontologicalNatures.natures.flatMap((nature) =>
                    tontoNatureUtils.getNatureFromAst(nature)
                );
                /**
         * This checks if the declaration of natures is redundant, because the nature
         * of this element is already defined by its specializations
         */
                if (compareArrays(parsedNatures, parentNatures)) {
                    accept(
                        "warning",
                        "Redundant nature declaration. The ontological natures of this element is already defined from its specializations",
                        {
                            node: classDeclaration,
                            property: "ontologicalNatures",
                            code: 300,
                        }
                    );
                }
            }
        });
    }
}
