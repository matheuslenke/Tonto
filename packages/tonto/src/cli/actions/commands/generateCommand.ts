import chalk from "chalk";
import { NodeFileSystem } from "langium/node";
import { Model } from "../../../language/index.js";
import { TontoServices, createTontoServices } from "../../../language/tonto-module.js";
import { extractAstNode } from "../../cli-util.js";
import { generateJSONFileModular } from "../../generators/jsonModular.generator.js";
import { generateJSONFile } from "../../jsonGenerator.js";
import { TontoManifest } from "../../model/grammar/TontoManifest.js";
import { buildFolderDocuments } from "../../utils/buildFolderDocuments.js";
import { readOrCreateDefaultTontoManifest } from "../../utils/readManifest.js";

export const generateCommand = async (fileName: string, destination: string): Promise<string | undefined> => {
    const services = createTontoServices({ ...NodeFileSystem }).Tonto;
    const model = await extractAstNode<Model>(fileName, services);
    const generatedFilePath = generateJSONFile(model, fileName, destination);
    return generatedFilePath;
};

// TODO: Make this function generate file on folder
export async function generateModularCommand(dir: string, label?: string, description?: string): Promise<string | undefined> {
    const services = createTontoServices({ ...NodeFileSystem }).Tonto;

    let manifest: TontoManifest;

    try {
        /**
         * Create Tonto Manifest file if it does not exist or read from an existing
         * one
         */
        manifest = readOrCreateDefaultTontoManifest(dir);

        console.log(chalk.bold("tonto.json file parsed successfully."));
        const createdFile = await createModel(dir, manifest, services, label, description);

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
    label?: string,
    description?: string
): Promise<string | undefined> {
    const { folderAbsolutePath, models } = await buildFolderDocuments(dir, services, { manifest });

    generateJSONFileModular(models, manifest, folderAbsolutePath, label, description);

    return `${manifest.projectName}.json`;
}
