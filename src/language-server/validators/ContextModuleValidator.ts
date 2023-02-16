import { ValidationAcceptor } from "langium";
import {
  ClassDeclaration,
  ContextModule,
  ElementRelation,
  GeneralizationSet,
} from "../generated/ast";
import { checkCircularSpecializationRecursiveWithGenset } from "../utils/CheckCircularSpecializationRecursive";

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
    let names: string[] = [];

    contextModule.declarations.forEach((declaration) => {
      if (declaration.$type === "ElementRelation") {
        const elementRelation = declaration as ElementRelation;
        const nameExists = names.find((name) => name === elementRelation.name);
        const refName = elementRelation.name;

        if (nameExists) {
          accept("error", "Duplicated Reference declaration", {
            node: elementRelation,
            property: "name",
          });
        } else if (refName !== undefined) {
          names.push(elementRelation.name!);
        }
      } else if (declaration.$type === "ClassDeclaration") {
        const classElement = declaration as ClassDeclaration;
        classElement.references.forEach((elementRelation) => {
          const nameExists = names.find(
            (name) => name === elementRelation.name
          );
          const refName = elementRelation.name;

          if (nameExists) {
            accept("error", "Duplicated Reference declaration", {
              node: elementRelation,
              property: "name",
            });
          } else if (refName !== undefined) {
            names.push(elementRelation.name!);
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
}
