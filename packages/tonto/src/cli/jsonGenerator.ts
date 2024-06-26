import { CompositeGeneratorNode } from "langium/generate";
import * as fs from "node:fs";
import * as path from "node:path";
import { MultilingualText, Project } from "ontouml-js";
import { Model } from "../language/index.js";
import { extractDestinationAndName } from "./cli-util.js";
import { contextModuleGenerator } from "./generators/contextModule.generator.js";

export function generateJSONFile(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);

    const ctx = <GeneratorContext>{
        model,
        name: data.name,
        fileName: `${data.name}.json`,
        destination: data.destination,
        fileNode: new CompositeGeneratorNode(),
    };
    return generate(ctx);
}

export interface GeneratorContext {
    model: Model
    name: string
    fileName: string
    destination: string
    fileNode: CompositeGeneratorNode
}

function generate(ctx: GeneratorContext): string {
    // Every OntoUML element can be created from a constructor that can receive a partial object
    // as references for its creation
    const project = parseProject(ctx);

    const projectSerialization = JSON.stringify(project, null, 2);
    ctx.fileNode.append(projectSerialization);

    if (!fs.existsSync(ctx.destination)) {
        fs.mkdirSync(ctx.destination, { recursive: true });
    }
    const generatedFilePath = path.join(ctx.destination, ctx.fileName);
    // fs.writeFileSync(generatedFilePath, isGeneratorNode(ctx.fileNode));
    return generatedFilePath;
}

export function parseProject(ctx: GeneratorContext): Project {
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
