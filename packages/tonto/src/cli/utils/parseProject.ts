import { MultilingualText, Project } from "ontouml-js";
import { Model, getPrimaryContextModuleOrThrow } from "../../language/index.js";
import { contextModuleGenerator } from "../generators/contextModule.generator.js";

export interface ParseProjectContext {
    model: Model;
    name: string;
}

export function parseProject(ctx: ParseProjectContext): Project {
    const project = new Project({
        name: new MultilingualText(`${ctx.name}`),
    }); // creates an OntoUML projects
    const rootModel = project.createModel({
        name: new MultilingualText("root"),
    });

    const contextModule = getPrimaryContextModuleOrThrow(ctx.model);

    const createdPackage = rootModel.createPackage(contextModule.name);
    // Generate a contextModule
    contextModuleGenerator(contextModule, createdPackage);
    return project;
}
