import { ValidationAcceptor } from "langium";
import {
  ClassDeclaration,
  ContextModule,
  ElementRelation,
  GeneralizationSet,
} from "../generated/ast";
import { checkCircularSpecializationRecursiveWithGenset } from "../utils/CheckCircularSpecializationRecursive";
import { TontoQualifiedNameProvider } from "../references/tonto-name-provider";
import { isSortalOntoCategory, isUltimateSortalOntoCategory } from "../models/OntologicalCategory";
import { checkSortalSpecializesUniqueUltimateSortalRecursive } from "../utils/CheckSortalSpecializesUniqueUltimateSortalRecursive";
import { ErrorMessages } from "../models/ErrorMessages";

export class ContextModuleValidator {
  checkContextModuleStartsWithCapital(
    contextModule: ContextModule,
    accept: ValidationAcceptor
  ): void {
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

  checkDuplicatedClassName(
    contextModule: ContextModule,
    accept: ValidationAcceptor
  ): void {
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

  checkDuplicatedRelationName(
    contextModule: ContextModule,
    accept: ValidationAcceptor
  ): void {
    const names: string[] = [];
    const nameProvider = new TontoQualifiedNameProvider();

    contextModule.declarations.forEach((declaration) => {
      if (declaration.$type === "ElementRelation") {
        const elementRelation = declaration as ElementRelation;
        const nameExists = names.find((name) => name === nameProvider.getQualifiedName(elementRelation));
        const refName = elementRelation.name;

        if (nameExists) {
          accept("error", "Duplicated Reference declaration", {
            node: elementRelation,
            property: "name",
          });
        } else if (refName !== undefined) {
          const qualifiedName = nameProvider.getQualifiedName(elementRelation);
          if (qualifiedName) {
            names.push(qualifiedName);
          }
        }
      } else if (declaration.$type === "ClassDeclaration") {
        const classElement = declaration as ClassDeclaration;
        classElement.references.forEach((elementRelation) => {
          const nameExists = names.find(
            (name) => name === nameProvider.getQualifiedName(elementRelation)
          );
          const refName = nameProvider.getQualifiedName(elementRelation);

          if (nameExists) {
            accept("error", "Duplicated Reference declaration", {
              node: elementRelation,
              property: "name",
            });
          } else if (refName !== undefined) {
            const qualifiedName = nameProvider.getQualifiedName(elementRelation);
            if (qualifiedName) {
              names.push(qualifiedName);
            }
          }
        });
      }
    });
  }

  /**
   * Checks if a ClassDeclaration has a ciclic specialization considering also
   * considering generalizationSets
   */
  checkCircularSpecialization(
    contextModule: ContextModule,
    accept: ValidationAcceptor
  ): void {
    const genSets = contextModule.declarations.filter((declaration) => {
      return declaration.$type === "GeneralizationSet";
    }) as GeneralizationSet[];

    const declaredClasses: ClassDeclaration[] =
      contextModule.declarations.filter((declaration) => {
        return declaration.$type === "ClassDeclaration";
      }) as ClassDeclaration[];

    declaredClasses.forEach((declaredClass) => {
      checkCircularSpecializationRecursiveWithGenset(
        declaredClass,
        [],
        genSets,
        accept
      );
    });
    genSets.forEach((genSet) => {
      checkCircularSpecializationRecursiveWithGenset(
        genSet,
        [],
        genSets,
        accept
      );
    });
  }

  checkClassDeclarationShouldSpecializeUltimateSortal(
    contextModule: ContextModule,
    accept: ValidationAcceptor
  ): void {
    const genSets = contextModule.declarations.filter((declaration) => {
      return declaration.$type === "GeneralizationSet";
    }) as GeneralizationSet[];

    const declaredClasses: ClassDeclaration[] =
      contextModule.declarations.filter((declaration) => {
        return declaration.$type === "ClassDeclaration";
      }) as ClassDeclaration[];

    declaredClasses.forEach((declaredClass) => {
      const ontologicalCategory = declaredClass.classElementType?.ontologicalCategory;
      if (!ontologicalCategory) {
        return;
      }
      // Check if it is a Sortal but not an Ultimate Sortal
      if (
        isSortalOntoCategory(ontologicalCategory) &&
        !isUltimateSortalOntoCategory(ontologicalCategory)
      ) {
        const totalUltimateSortalSpecializations =
          checkSortalSpecializesUniqueUltimateSortalRecursive(
            declaredClass,
            genSets,
            accept,
            0
          );
        if (totalUltimateSortalSpecializations === 0) {
          const natures = declaredClass.ontologicalNatures?.natures;
          if (natures) {
            const isRestrictedToType = natures.find(
              (nature) => nature === "types"
            );
            if (isRestrictedToType === undefined) {
              accept(
                "error",
                ErrorMessages.sortalSpecializesUniqueUltimateSortal,
                {
                  node: declaredClass,
                  property: "name",
                }
              );
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
    // genSets.forEach((_genSet) => {
    //   // checkCircularSpecializationRecursiveWithGenset(
    //   //   genSet,
    //   //   [],
    //   //   genSets,
    //   //   accept
    //   // );
    // });
  }
}
