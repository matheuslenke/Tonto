import { MultilingualText, Project, Package, Generalization, GeneralizationSet, Class, Relation } from "ontouml-js";
import { Model } from "../language-server";
import { contextModuleGenerator } from "./JsonGenerators/contextModule.generator";

interface GeneratorContext {
  model: Model;
  name: string;
}

export interface diagramContent {
  packages: Array<Package>,
  class: Array<Array<Class>>,
  specializations: Array<Array<Generalization>>,
  specializationSets: Array<Array<GeneralizationSet>>,
  relations: Array<Array<Relation>>
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

  let content: diagramContent = {
    packages: project.getAllPackages(),
    class: project.getAllPackages().map((package_) => { return package_.getAllClasses()}),
    specializations: project.getAllPackages().map((package_) => { return package_.getAllGeneralizations() }),
    specializationSets: project.getAllPackages().map((package_) => { return package_.getAllGeneralizationSets() }),
    relations: project.getAllPackages().map((package_) => { return package_.getAllRelations() })
  }

  content.packages.shift();
  content.packages.forEach((package_, i) => {
    content.specializationSets[i].forEach((genSet) => {
      genSet.generalizations.forEach((genSetGen) => {
        
        let index = content.specializations[i].findIndex((gen) => { return gen ===  genSetGen});
        if(index >= 0) content.specializations[i].splice(index, 1);
      });
    })
  });

  return content;
// context.AllEnumerations = project.getAllEnumerations();
// context.AllProperties = project.getAllProperties();
// context.AllAttributes = project.getAllAttributes();
// context.AllLiterals = project.getAllLiterals();
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