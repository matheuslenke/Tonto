
import chalk from "chalk";
import { glob } from "glob";
import { NodeFileSystem } from "langium/node";
import path from "path";
import { Model, builtInLibs } from "../../../language/index.js";
import { TontoServices, createTontoServices } from "../../../language/tonto-module.js";
import { extractAllAstNodes, extractAstNode } from "../../cli-util.js";
import { generateJSONFileModular } from "../../generators/jsonModular.generator.js";
import { generateJSONFile } from "../../jsonGenerator.js";
import { TontoManifest } from "../../model/grammar/TontoManifest.js";
import { readOrCreateDefaultTontoManifest } from "../../utils/readManifest.js";

export const generateCommand = async (fileName: string, destination: string): Promise<string | undefined> => {
    const services = createTontoServices({ ...NodeFileSystem }).Tonto;
    const model = await extractAstNode<Model>(fileName, services);
    const generatedFilePath = generateJSONFile(model, fileName, destination);
    return generatedFilePath;
};

// TODO: Make this function generate file on folder
export async function generateModularCommand(dir: string): Promise<string | undefined> {
    const services = createTontoServices({ ...NodeFileSystem }).Tonto;

    let manifest: TontoManifest;
    let folderAbsolutePath: string;
    // Find tonto.json file
    try {
        /**
         * Create Tonto Manifest file if it does not exist or read from an existing
         * one
         */
        manifest = readOrCreateDefaultTontoManifest(dir);

        console.log(chalk.bold("tonto.json file parsed successfully."));
        folderAbsolutePath = path.resolve(dir);
        const createdFile = await createModel(dir, manifest, services, folderAbsolutePath);

        console.log(chalk.green("JSON File generated successfully: "));
        return Promise.resolve(createdFile);
    } catch (error) {
        console.log(chalk.red(error));
        return Promise.reject();
    }
}

async function createModel(
    dir: string,
    manifest: TontoManifest,
    services: TontoServices,
    folderAbsolutePath: string
): Promise<string | undefined> {
    const allFiles = await glob(dir + "/**/*.tonto");

    const models: Model[] = await extractAllAstNodes(allFiles, services, builtInLibs, false);

    generateJSONFileModular(models, manifest, folderAbsolutePath);

    return `${manifest.projectName}.json`;
}