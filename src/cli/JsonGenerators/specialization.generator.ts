import {
  ContextModule,
  ClassElement,
  ElementRelation,
} from "../../language-server/generated/ast";
import { Package, Class, Relation } from "ontouml-js";
import { generalizationGenerator } from "./class.generator";
import { relationGeneralizationGenerator } from "./relation.generator";

export function generateSpecializations(
  contextModule: ContextModule,
  classes: Class[],
  relations: Relation[],
  packageItem: Package
): void {
  contextModule.elements.forEach((element) => {
    if (element.$type === "ClassElement") {
      const classElement = element as ClassElement;
      if (classElement.specializationEndurants.length > 0) {
        const sourceClass = classes.find(
          (item) => item.name.getText() === classElement.name
        );

        if (sourceClass) {
          classElement.specializationEndurants.forEach((endurant) => {
            console.log(endurant.ref?.name)
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
            }
          });
        }
      }
      // Generate external ElementRelation specializations
    } else if (element.$type === "ElementRelation") {
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

export function generateInternalRelationSpecialization(
  classElement: ClassElement,
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