import { CompositeGeneratorNode } from "langium/generate";
import * as fs from "node:fs";
import * as path from "node:path";
import { Model } from "../../language/index.js";
import { TontoManifest } from "../model/grammar/TontoManifest.js";
import { JSON_GENERATION_STEPS, normalizeJsonGenerationError } from "../requests/jsonGeneration.js";
import { serializeProject } from "../utils/serializeProject.js";
import { ModularGeneratorContext, parseProjectModular } from "../utils/parseProjectModular.js";

export function generateJSONFileModular(
    models: Model[],
    tontoManifest: TontoManifest,
    folderAbsolutePath: string,
    label?: string,
    description?: string
): string {
    const ctx: ModularGeneratorContext = {
        models,
        manifest: tontoManifest,
        fileNode: new CompositeGeneratorNode(),
        folderAbsolutePath,
        label,
        description,
    };
    return generate(ctx);
}

function generate(ctx: ModularGeneratorContext): string {
    /**
   * First we need to parse the project and create all elements
   */
    const project = (() => {
        try {
            return parseProjectModular(ctx);
        } catch (error) {
            throw normalizeJsonGenerationError(
                error,
                `Could not create the OntoUML project for "${ctx.manifest.projectName}".`,
                JSON_GENERATION_STEPS.projectCreation
            );
        }
    })();

    /**
   * Now, we convert the project to JSON and save it to a file
   */
    const destinationFolder = path.join(ctx.folderAbsolutePath, ctx.manifest.outFolder);
    const destinationFile = path.join(destinationFolder, project.name.getText() + ".json");

    const projectSerialization = (() => {
        try {
            return serializeProject(project);
        } catch (error) {
            throw normalizeJsonGenerationError(
                error,
                `Could not serialize the generated OntoUML project for "${ctx.manifest.projectName}".`,
                JSON_GENERATION_STEPS.serialization
            );
        }
    })();

    ctx.fileNode.append(projectSerialization);

    try {
        if (!fs.existsSync(destinationFolder)) {
            fs.mkdirSync(destinationFolder, { recursive: true });
        }

        fs.writeFileSync(destinationFile, projectSerialization);
        return destinationFile;
    } catch (error) {
        throw normalizeJsonGenerationError(
            error,
            `Could not write the generated JSON file "${path.basename(destinationFile)}".`,
            JSON_GENERATION_STEPS.fileWriting
        );
    }
}
