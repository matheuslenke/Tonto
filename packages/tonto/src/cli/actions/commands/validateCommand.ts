
import { glob } from "glob";
import { CompositeGeneratorNode } from "langium/generate";
import { NodeFileSystem } from "langium/node";
import * as fs from "node:fs";
import path from "node:path";
import { Model, builtInLibs, createTontoServices } from "../../../index.js";
import { extractAllAstNodes } from "../../cli-util.js";
import { GeneratorContext, parseProject } from "../../generators/jsonModular.generator.js";
import { ErrorResultResponse, ResultResponse, TontoManifest, createDefaultTontoManifest, validateTontoFile } from "../../main.js";

export const validateCommand = async (dirName: string): Promise<ResultResponse[] | ErrorResultResponse> => {
    const services = createTontoServices({ ...NodeFileSystem }).Tonto;

    let manifest: TontoManifest | undefined;

    const folderAbsolutePath = path.resolve(dirName);

    if (!fs.existsSync(path.join(folderAbsolutePath, "tonto.json"))) {
        manifest = createDefaultTontoManifest();
    } else {
        const filePath = path.join(dirName, "tonto.json");

        const tontoManifestContent = fs.readFileSync(filePath, "utf-8");
        manifest = JSON.parse(tontoManifestContent);
    }

    if (manifest === undefined) {
        return {
            status: 400,
            message: "Could not find or create default tonto.json file",
        } as ErrorResultResponse;
    }

    const allFiles = await glob(dirName + "/**/*.tonto");

    const models: Model[] = await extractAllAstNodes(allFiles, services, builtInLibs, false);

    const context: GeneratorContext = {
        models,
        fileNode: new CompositeGeneratorNode(),
        manifest: manifest,
        folderAbsolutePath,
    };

    const project = parseProject(context);

    const validationResult = validateTontoFile(project);

    if (validationResult) {
        return validationResult;
    } else {
        return {
            status: 500,
            message: "Validation failed",
        } as ErrorResultResponse;
    }
};
