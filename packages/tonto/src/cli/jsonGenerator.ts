import { CompositeGeneratorNode } from "langium/generate";
import * as fs from "node:fs";
import * as path from "node:path";
import { Model } from "../language/index.js";
import { extractDestinationAndName } from "./cli-util.js";
import { JSON_GENERATION_STEPS, normalizeJsonGenerationError } from "./requests/jsonGeneration.js";
import { serializeProject } from "./utils/serializeProject.js";
import { ParseProjectContext, parseProject } from "./utils/parseProject.js";

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

export interface GeneratorContext extends ParseProjectContext {
    fileName: string
    destination: string
    fileNode: CompositeGeneratorNode
}

function generate(ctx: GeneratorContext): string {
    // Every OntoUML element can be created from a constructor that can receive a partial object
    // as references for its creation
    const project = (() => {
        try {
            return parseProject(ctx);
        } catch (error) {
            throw normalizeJsonGenerationError(
                error,
                `Could not create the OntoUML project for "${ctx.name}".`,
                JSON_GENERATION_STEPS.projectCreation
            );
        }
    })();

    const projectSerialization = (() => {
        try {
            return serializeProject(project);
        } catch (error) {
            throw normalizeJsonGenerationError(
                error,
                `Could not serialize the generated OntoUML project for "${ctx.name}".`,
                JSON_GENERATION_STEPS.serialization
            );
        }
    })();

    ctx.fileNode.append(projectSerialization);

    try {
        if (!fs.existsSync(ctx.destination)) {
            fs.mkdirSync(ctx.destination, { recursive: true });
        }
        const generatedFilePath = path.join(ctx.destination, ctx.fileName);
        fs.writeFileSync(generatedFilePath, projectSerialization);
        return generatedFilePath;
    } catch (error) {
        throw normalizeJsonGenerationError(
            error,
            `Could not write the generated JSON file "${ctx.fileName}".`,
            JSON_GENERATION_STEPS.fileWriting
        );
    }
}
