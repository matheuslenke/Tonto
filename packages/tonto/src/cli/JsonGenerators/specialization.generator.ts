import { Class, Package, Relation } from "ontouml-js";
import {
  ClassDeclaration, ContextModule, ElementRelation
} from "../../language-server";
import { generalizationGenerator } from "./class.generator";
import { relationGeneralizationGenerator } from "./relation.generator";
import chalk from "chalk";

export function generateSpecializations(
  contextModule: ContextModule,
  classes: Class[],
  relations: Relation[],
  packageItem: Package
): void {
  contextModule.declarations.forEach((declaration) => {
    if (declaration.$type === "ClassDeclaration") {
      const classElement = declaration as ClassDeclaration;
      if (classElement.specializationEndurants.length > 0) {
        const sourceClass = classes.find(
          (item) => item.name.getText() === classElement.name
        );

        if (sourceClass) {
          classElement.specializationEndurants.forEach((endurant) => {
            const targetClass = classes.find(
              (item) => item.name.getText() === endurant.ref?.name
            );
            if (targetClass) {
              generalizationGenerator(packageItem, targetClass, sourceClass);
              generateInternalRelationSpecialization(
                classElement,
                relations,
                packageItem
              );
            } else {
              console.log(chalk.yellow(
                `Warning: Could not create specialization between class ${classElement.name} and 
                ${endurant.ref?.name} not found in context module ${contextModule.name})`
              ));
            }
          });
        } else {
          console.log(chalk.yellow(
            `Warning: Could not create specializations for Class ${classElement.name} \
            because it was not found in context module ${contextModule.name})`
          ));
        }
      }
      // Generate external ElementRelation specializations
    } else if (declaration.$type === "ElementRelation") {
      const elementRelation = declaration as ElementRelation;
      if (elementRelation.specializeRelation) {
        const elementRelationCreated = relations.find(
          (item) => item.name.getText() === elementRelation.name
        );

        if (elementRelationCreated) {
          const targetRelation = relations.find(
            (item) =>
              item.name.getText() ===
              elementRelation.specializeRelation?.ref?.name
          );
          if (targetRelation) {
            relationGeneralizationGenerator(
              packageItem,
              elementRelationCreated,
              targetRelation
            );
          }
        } else {
          console.log(chalk.yellow(
            `Warning: Could not create specializations for Relation ${elementRelation.name ?? "(No name)"} \
            because it was not found in context module ${contextModule.name})`
          ));
        }
      }
    }
  });
}

export function generateInternalRelationSpecialization(
  classElement: ClassDeclaration,
  relations: Relation[],
  packageItem: Package
) {
  classElement.references.forEach((element) => {
    if (element.$type === "ElementRelation") {
      const elementRelation = element as ElementRelation;
      if (elementRelation.specializeRelation) {
        const elementRelationCreated = relations.find(
          (item) => item.name.getText() === elementRelation.name
        );

        if (elementRelationCreated) {
          const targetRelation = relations.find(
            (item) =>
              item.name.getText() ===
              elementRelation.specializeRelation?.ref?.name
          );

          if (targetRelation) {
            relationGeneralizationGenerator(
              packageItem,
              elementRelationCreated,
              targetRelation
            );
          }
        }
      }
    }
  });
}