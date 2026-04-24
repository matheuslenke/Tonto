import { MultilingualText, Project } from "ontouml-js";
import { Model, getPrimaryContextModuleOrThrow } from "../../language/index.js";
import { contextModuleGenerator } from "../generators/contextModule.generator.js";
import {
    JSON_GENERATION_STEPS,
    createJsonGenerationError,
    createJsonGenerationNodeInfo,
    normalizeJsonGenerationError,
} from "../requests/jsonGeneration.js";

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

    let contextModule: ReturnType<typeof getPrimaryContextModuleOrThrow>;
    try {
        contextModule = getPrimaryContextModuleOrThrow(ctx.model);
    } catch (error) {
        throw createJsonGenerationError(`Could not generate JSON from "${ctx.name}" because the model has no package declaration.`, {
            step: JSON_GENERATION_STEPS.projectCreation,
            error,
            info: [
                createJsonGenerationNodeInfo(ctx.model, {
                    code: "missing_package_declaration",
                    title: "Missing package declaration",
                    description: "Every Tonto file must declare a package before classes, datatypes, and relations can be transformed to JSON.",
                }),
            ],
        });
    }

    const createdPackage = rootModel.createPackage(contextModule.name);

    try {
        contextModuleGenerator(contextModule, createdPackage);
    } catch (error) {
        throw normalizeJsonGenerationError(
            error,
            `Could not generate the OntoUML project for package "${contextModule.name}".`,
            JSON_GENERATION_STEPS.projectCreation
        );
    }

    return project;
}
