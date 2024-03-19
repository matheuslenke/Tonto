import { Class, Generalization, GeneralizationSet, MultilingualText, Package, Project, Relation } from "ontouml-js";
import { contextModuleGenerator } from "../cli/generators/contextModule.generator.js";
import { Model } from "../language/index.js";

interface GeneratorContext {
  model: Model;
  name: string;
}

export interface diagramContent {
  packages: Package,
  class: Array<Class>,
  specializations: Array<Generalization>,
  specializationSets: Array<GeneralizationSet>,
  relations: Array<Relation>
}

export function extractContent(model: Model, name: string | undefined): diagramContent {
  const ctx = <GeneratorContext>{
    model,
    name,
  };
  return generate(ctx);
}

function generate(ctx: GeneratorContext): diagramContent {
  // Every OntoUML element can be created from a constructor that can receive a partial object
  // as references for its creation
  const project = parseProject(ctx);
  const packs = project.getAllPackages();
  packs.shift();

  const content: diagramContent = {
    packages: packs[0],
    class: packs[0].getAllClasses(),
    specializations: packs[0].getAllGeneralizations(),
    specializationSets: packs[0].getAllGeneralizationSets(),
    relations: packs[0].getAllRelations()
  };

  content.specializationSets.forEach((genSet) => {
    genSet.generalizations.forEach((genSetGen) => {

      const index = content.specializations.findIndex((gen) => { return gen === genSetGen; });
      if (index >= 0) content.specializations.splice(index, 1);
    });
  });
  return content;
}

function parseProject(ctx: GeneratorContext): Project {
  const project = new Project({
    name: new MultilingualText(`${ctx.name}`),
  }); // creates an OntoUML projects
  const rootModel = project.createModel({
    name: new MultilingualText("root"),
  });

  const contextModule = ctx.model.module;

  const createdPackage = rootModel.createPackage(contextModule.name);
  // Generate a contextModule
  contextModuleGenerator(contextModule, createdPackage);
  return project;
}