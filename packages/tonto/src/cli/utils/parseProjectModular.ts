import { CompositeGeneratorNode } from "langium/generate";
import { MultilingualText, OntoumlElement, Package, Project } from "ontouml-js";
import { Model, getModelImports, getPrimaryContextModuleOrThrow } from "../../language/index.js";
import { TontoManifest } from "../model/grammar/TontoManifest.js";
import { GeneratedContextModuleData, contextModuleGenerateClasses, contextModuleGenerateRelations, contextModuleModularGenerator } from "../generators/contextModuleModular.generator.js";
import { generateUniqueId } from "../generators/utils/idGenerator.js";
import { setTontoSourceImports } from "./tontoMetadata.js";
import {
    JSON_GENERATION_STEPS,
    createJsonGenerationError,
    createJsonGenerationNodeInfo,
    normalizeJsonGenerationError,
} from "../requests/jsonGeneration.js";
import { warnJsonGenerationIssue } from "./jsonGenerationWarnings.js";

export interface ModularGeneratorContext {
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

function getContextModule(model: Model) {
    try {
        return getPrimaryContextModuleOrThrow(model);
    } catch (error) {
        throw createJsonGenerationError("Could not generate JSON because one of the model files has no package declaration.", {
            step: JSON_GENERATION_STEPS.projectCreation,
            error,
            info: [
                createJsonGenerationNodeInfo(model, {
                    code: "missing_package_declaration",
                    title: "Missing package declaration",
                    description: "Every Tonto source file must declare a package before modular JSON generation can continue.",
                }),
            ],
        });
    }
}

function getImportedNames(model: Model): string[] {
    return getModelImports(model)
        .flatMap((item) => item.referencedModel.ref?.name ? [item.referencedModel.ref.name] : []);
}

function getImportedTexts(model: Model): string[] {
    return getModelImports(model)
        .flatMap((item) => {
            const referencedName = item.referencedModel.ref?.name;
            if (!referencedName) {
                return [];
            }

            if (item.packageAlias) {
                return [`${referencedName} as ${item.packageAlias}`];
            }

            return [referencedName];
        });
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
        const modelName = getContextModule(model).name;
        modelMap.set(modelName, model);
        dependencies.set(modelName, new Set());
        inDegree.set(modelName, 0);
    }

    // Build dependency graph
    for (const model of models) {
        const modelName = getContextModule(model).name;
        for (const imp of getModelImports(model)) {
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
        const modelName = getContextModule(model).name;
        if (inDegree.get(modelName) === 0) {
            queue.push(model);
        }
    }

    while (queue.length > 0) {
        const current = queue.shift()!;
        sorted.push(current);
        const currentName = getContextModule(current).name;

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

export function parseProjectModular(ctx: ModularGeneratorContext): Project {
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
        const contextModule = getContextModule(model);
        let createdPackage: Package;
        let generatedContextModuleData: GeneratedContextModuleData;

        try {
            createdPackage = rootPackage.createPackage(contextModule.name);
            setTontoSourceImports(createdPackage, getImportedTexts(model));
            generatedContextModuleData = contextModuleGenerateClasses(contextModule, createdPackage);
        } catch (error) {
            throw normalizeJsonGenerationError(
                error,
                `Could not generate classes for package "${contextModule.name}".`,
                JSON_GENERATION_STEPS.classGeneration,
                [
                    createJsonGenerationNodeInfo(contextModule, {
                        code: "class_generation_failed",
                        title: "Class generation failed",
                        description: `The JSON generator could not create the classes and datatypes for package "${contextModule.name}".`,
                    }),
                ]
            );
        }

        const generatedModelData: GeneratedModelData = {
            package: createdPackage,
            model: model,
            generatedData: generatedContextModuleData,
        };
        generatedModelDatas.set(contextModule.name, generatedModelData);
    }

    /**
     * Secondly, we generate all the relations for each context module
     */
    sortedModels.forEach((model) => {
        const contextModule = getContextModule(model);
        const importedNames = getImportedNames(model);
        const arrayOfGeneratedModelDatas = Array.from(generatedModelDatas.values());

        const globalDataTypes = arrayOfGeneratedModelDatas
            .filter((data) => getContextModule(data.model).isGlobal)
            .map((data) => data.generatedData);
        const importedDataTypes = arrayOfGeneratedModelDatas
            .filter((data) => importedNames.includes(getContextModule(data.model).name))
            .map((data) => data.generatedData);

        const createdPackage = generatedModelDatas.get(contextModule.name)?.package;
        const generatedContextModelData = generatedModelDatas.get(contextModule.name)?.generatedData;
        if (createdPackage && generatedContextModelData) {
            try {
                contextModuleGenerateRelations(contextModule, createdPackage, generatedContextModelData, [
                    ...importedDataTypes,
                    ...globalDataTypes,
                ]);
            } catch (error) {
                warnJsonGenerationIssue(
                    normalizeJsonGenerationError(
                        error,
                        `Could not generate all relations for package "${contextModule.name}". The JSON file will still be written with the generated elements that remain valid.`,
                        JSON_GENERATION_STEPS.relationGeneration,
                        [
                            createJsonGenerationNodeInfo(contextModule, {
                                code: "relation_generation_failed",
                                title: "Relation generation failed",
                                description: `The JSON generator skipped one or more relations for package "${contextModule.name}".`,
                            }),
                        ]
                    )
                );
            }
        }
    });

    /**
     * Then, we navigate again through the models and generate the missing elements
     * that needed the references of the classes and relations generated in the previous step
     */
    sortedModels.forEach((model) => {
        const contextModule = getContextModule(model);
        const importedNames = getImportedNames(model);
        const arrayOfGeneratedModelDatas = Array.from(generatedModelDatas.values());

        const globalDataTypes = arrayOfGeneratedModelDatas
            .filter((data) => getContextModule(data.model).isGlobal)
            .map((data) => data.generatedData);
        const importedDataTypes = arrayOfGeneratedModelDatas
            .filter((data) => importedNames.includes(getContextModule(data.model).name))
            .map((data) => data.generatedData);

        const createdPackage = generatedModelDatas.get(contextModule.name)?.package;
        const generatedContextModelData = generatedModelDatas.get(contextModule.name)?.generatedData;

        if (createdPackage && generatedContextModelData) {
            try {
                contextModuleModularGenerator(contextModule, generatedContextModelData, createdPackage, [
                    ...importedDataTypes,
                    ...globalDataTypes,
                ]);
            } catch (error) {
                warnJsonGenerationIssue(
                    normalizeJsonGenerationError(
                        error,
                        `Could not finish all semantic generation for package "${contextModule.name}". The JSON file will still be written with the generated elements that remain valid.`,
                        JSON_GENERATION_STEPS.projectCreation,
                        [
                            createJsonGenerationNodeInfo(contextModule, {
                                code: "semantic_generation_failed",
                                title: "Semantic generation failed",
                                description: `The JSON generator skipped one or more dependent semantic elements for package "${contextModule.name}".`,
                            }),
                        ]
                    )
                );
            }
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
