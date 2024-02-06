/**
 * <-- This file must be updated after every change on generated/ast.ts -->
 */

// import { CompositeGeneratorNode, Generated } from "langium";
import { OntologicalCategoryEnum } from "../../language-server/models/OntologicalCategory.js";

export class ClassDeclaration {
  name: string;
  ontologicalCategory: OntologicalCategoryEnum;
  ontologicalNatures: string;
  instanceOf?: ClassDeclaration;
  specializationItems: ClassDeclaration[];
  attributes: string;
  relations: string;

  constructor(
    name: string,
    ontologicalCategory: OntologicalCategoryEnum,
    ontologicalNatures: string,
    specializationItems: ClassDeclaration[],
    attributes: string,
    relations: string,
    instanceOf?: ClassDeclaration
  ) {
    this.name = name;
    this.ontologicalCategory = ontologicalCategory;
    this.ontologicalNatures = ontologicalNatures;
    this.specializationItems = specializationItems;
    this.instanceOf = instanceOf;
    this.attributes = attributes;
    this.relations = relations;
  }
}
