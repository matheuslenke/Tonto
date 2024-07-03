import { glob } from "glob";
import { CompositeGeneratorNode } from "langium/generate";
import { NodeFileSystem } from "langium/node";
import * as fs from "node:fs";
import { Ontouml2Gufo, ServiceIssue } from "ontouml-js";
import path from "path";
import { Model, builtInLibs } from "../../../language/index.js";
import { createTontoServices } from "../../../language/tonto-module.js";
import { extractAllAstNodes } from "../../cli-util.js";
import { GeneratorContext, parseProject } from "../../generators/jsonModular.generator.js";
import { TontoManifest, createDefaultTontoManifest } from "../../main.js";

type GufoResult = {
    result: unknown;
    issues?: ServiceIssue[] | undefined;
}

export const transformToGufoLocalCommand = async (
    dirName: string
): Promise<GufoResult | undefined> => {
    const services = createTontoServices({ ...NodeFileSystem }).Tonto;
    let manifest: TontoManifest | undefined;

    const folderAbsolutePath = path.resolve(dirName);

    if (!fs.existsSync(path.join(folderAbsolutePath, "tonto.json"))) {
        manifest = createDefaultTontoManifest();
    } else {
        const filePath = path.join(folderAbsolutePath, "tonto.json");
        const tontoManifestContent = fs.readFileSync(filePath, "utf-8");
        manifest = JSON.parse(tontoManifestContent);
    }

    if (manifest === undefined) {
        return undefined;
    }

    const allFiles = await glob(folderAbsolutePath + "/**/*.tonto");

    const models: Model[] = await extractAllAstNodes(allFiles, services, builtInLibs, false);

    const context: GeneratorContext = {
        models,
        fileNode: new CompositeGeneratorNode(),
        manifest: manifest,
        folderAbsolutePath,
    };

    const project = parseProject(context);
    const service = new Ontouml2Gufo(project);
    const response = service.run();

    return response;
};