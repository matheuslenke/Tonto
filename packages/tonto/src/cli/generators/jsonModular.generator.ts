import { CompositeGeneratorNode } from "langium/generate";
import * as fs from "node:fs";
import * as path from "node:path";
import { MultilingualText, OntoumlElement, Package, Project } from "ontouml-js";
import { Model } from "../../language/index.js";
import { TontoManifest } from "../model/grammar/TontoManifest.js";
import { GeneratedContextModuleData, contextModuleGenerateClasses, contextModuleGenerateRelations, contextModuleModularGenerator } from "./contextModuleModular.generator.js";
import { generateUniqueId } from "./utils/idGenerator.js";

export function generateJSONFileModular(
    models: Model[],
    tontoManifest: TontoManifest,
    folderAbsolutePath: string,
    label?: string,
    description?: string
): string {
    const ctx = <GeneratorContext>{
        models,
        manifest: tontoManifest,
        fileNode: new CompositeGeneratorNode(),
        folderAbsolutePath,
        label,
        description,
    };
    return generate(ctx);
}

export interface GeneratorContext {
    models: Model[]
    manifest: TontoManifest
    fileNode: CompositeGeneratorNode
    folderAbsolutePath: string
    label?: string
    description?: string
}

interface GeneratedModelData {
    package: Package
    model: Model
    generatedData: GeneratedContextModuleData
}

/**
 * Sorts models topologically based on their import dependencies.
 * Models with no imports (or whose dependencies are already processed) come first.
 */
function sortModelsTopologically(models: Model[]): Model[] {
    const modelMap = new Map<string, Model>();
    const dependencies = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    // Build model map and initialize structures
    for (const model of models) {
        const modelName = model.module.name;
        modelMap.set(modelName, model);
        dependencies.set(modelName, new Set());
        inDegree.set(modelName, 0);
    }

    // Build dependency graph
    for (const model of models) {
        const modelName = model.module.name;
        for (const imp of model.imports) {
            const importedModule = imp.referencedModel.ref;
            if (importedModule) {
                const importedName = importedModule.name;
                if (modelMap.has(importedName)) {
                    dependencies.get(importedName)!.add(modelName);
                    inDegree.set(modelName, (inDegree.get(modelName) || 0) + 1);
                }
            }
        }
    }

    // Topological sort using Kahn's algorithm
    const sorted: Model[] = [];
    const queue: Model[] = [];

    // Start with models that have no dependencies
    for (const model of models) {
        const modelName = model.module.name;
        if (inDegree.get(modelName) === 0) {
            queue.push(model);
        }
    }

    while (queue.length > 0) {
        const current = queue.shift()!;
        sorted.push(current);
        const currentName = current.module.name;

        // Decrease in-degree for dependent models
        for (const dependentName of dependencies.get(currentName)!) {
            const newInDegree = (inDegree.get(dependentName) || 0) - 1;
            inDegree.set(dependentName, newInDegree);
            if (newInDegree === 0) {
                const dependentModel = modelMap.get(dependentName);
                if (dependentModel) {
                    queue.push(dependentModel);
                }
            }
        }
    }

    // If there are cycles or unresolved dependencies, add remaining models
    for (const model of models) {
        if (!sorted.includes(model)) {
            sorted.push(model);
        }
    }

    return sorted;
}

function generate(ctx: GeneratorContext): string {
    /**
   * First we need to parse the project and create all elements
   */
    const project = parseProject(ctx);

    /**
   * Now, we convert the project to JSON and save it to a file
   */
    const destinationFolder = path.join(ctx.folderAbsolutePath, ctx.manifest.outFolder);
    const destinationFile = path.join(destinationFolder, project.name.getText() + ".json");

    const projectSerialization = JSON.stringify(project, null, 2);
    ctx.fileNode.append(projectSerialization);

    if (!fs.existsSync(destinationFolder)) {
        fs.mkdirSync(destinationFolder);
    }

    fs.writeFileSync(destinationFile, projectSerialization);
    return destinationFile;
}

export function parseProject(ctx: GeneratorContext): Project {
    const project = new Project({
        name: new MultilingualText(ctx.manifest.projectName),
        description: ctx.description ? new MultilingualText(ctx.description) : undefined,
    });

    const rootPackage = project.createModel({
        name: new MultilingualText(ctx.manifest.projectName),
        description: ctx.description ? new MultilingualText(ctx.description) : undefined,
    });

    // Sort models topologically to ensure dependencies are processed first
    const sortedModels = sortModelsTopologically(ctx.models);

    const generatedModelDatas: Map<string, GeneratedModelData> = new Map();

    /**
     * First we generate all the classes for each context module
     */
    for (const model of sortedModels) {
        const contextModule = model.module;

        const createdPackage = rootPackage.createPackage(contextModule.name);

        const generatedContextModuleData = contextModuleGenerateClasses(contextModule, createdPackage);

        const generatedModelData: GeneratedModelData = {
            package: createdPackage,
            model: model,
            generatedData: generatedContextModuleData,
        };
        generatedModelDatas.set(model.module.name, generatedModelData);
    }

    /**
     * Secondly, we generate all the relations for each context module
     */
    sortedModels.forEach((model) => {
        const importedNames = model.imports.flatMap((e) => e.referencedModel.ref?.name).filter((e) => e !== undefined);
        const arrayOfGeneratedModelDatas = Array.from(generatedModelDatas.values());

        const globalDataTypes = arrayOfGeneratedModelDatas
            .filter((data) => data.model.module.isGlobal)
            .map((data) => data.generatedData);
        const importedDataTypes = arrayOfGeneratedModelDatas
            .filter((data) => importedNames.includes(data.model.module.name))
            .map((data) => data.generatedData);

        const createdPackage = generatedModelDatas.get(model.module.name)?.package;
        const generatedContextModelData = generatedModelDatas.get(model.module.name)?.generatedData;
        if (createdPackage && generatedContextModelData) {
            contextModuleGenerateRelations(model.module, createdPackage, generatedContextModelData, [
                ...importedDataTypes,
                ...globalDataTypes,
            ]);
        }
    });

    /**
     * Then, we navigate again through the models and generate the missing elements
     * that needed the references of the classes and relations generated in the previous step
     */
    sortedModels.forEach((model) => {
        const importedNames = model.imports.flatMap((e) => e.referencedModel.ref?.name).filter((e) => e !== undefined);
        const arrayOfGeneratedModelDatas = Array.from(generatedModelDatas.values());

        const globalDataTypes = arrayOfGeneratedModelDatas
            .filter((data) => data.model.module.isGlobal)
            .map((data) => data.generatedData);
        const importedDataTypes = arrayOfGeneratedModelDatas
            .filter((data) => importedNames.includes(data.model.module.name))
            .map((data) => data.generatedData);

        const createdPackage = generatedModelDatas.get(model.module.name)?.package;
        const generatedContextModelData = generatedModelDatas.get(model.module.name)?.generatedData;

        if (createdPackage && generatedContextModelData) {
            contextModuleModularGenerator(model.module, generatedContextModelData, createdPackage, [
                ...importedDataTypes,
                ...globalDataTypes,
            ]);
        }
    });

    assignUniqueIdsToAllElements(project);
    return project;
}

/**
 * Assigns a unique ID to all elements in the project.
 * Creates a map of elements to their new IDs and updates them accordingly.
 */
function assignUniqueIdsToAllElements(project: Project): void {
    const elementIdMap = new Map<OntoumlElement, string>();
    const allPackages = project.getAllPackages();
    
    // First pass: generate new IDs for all elements and store in map
    allPackages.forEach((pack) => {
    
    pack.getContents().forEach((element) => {
            elementIdMap.set(element, generateUniqueId());
        });
    });
    
    // Second pass: apply the new IDs to all elements from the map
    elementIdMap.forEach((newId, element) => {
        Object.assign(element, { id: newId });
    });
}
