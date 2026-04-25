import { glob } from "glob";
import { LangiumDocuments } from "langium";
import path from "node:path";
import { Model, builtInLibs } from "../../language/index.js";
import { TontoServices } from "../../language/tonto-module.js";
import { extractAllDocuments } from "../cli-util.js";
import { TontoManifest } from "../model/grammar/TontoManifest.js";
import { readOrCreateDefaultTontoManifest } from "./readManifest.js";

export interface BuiltFolderDocumentsResult {
    allFiles: string[]
    documents: LangiumDocuments
    folderAbsolutePath: string
    manifest: TontoManifest
    models: Model[]
}

export interface BuildFolderDocumentsOptions {
    validation?: boolean
    manifest?: TontoManifest
    warnOnValidationErrors?: boolean
}

function toGlobPath(filePath: string): string {
    return filePath.split(path.sep).join(path.posix.sep);
}

function getIgnoredProjectPaths(folderAbsolutePath: string, manifest: TontoManifest): string[] {
    if (!manifest.outFolder) {
        return [];
    }

    const outFolderAbsolutePath = path.resolve(folderAbsolutePath, manifest.outFolder);

    if (outFolderAbsolutePath === folderAbsolutePath) {
        return [];
    }

    return [`${toGlobPath(outFolderAbsolutePath)}/**`];
}

export async function getTontoProjectSourceFiles(
    dirName: string,
    manifest: TontoManifest
): Promise<string[]> {
    const folderAbsolutePath = path.resolve(dirName || process.cwd());

    return glob(`${toGlobPath(folderAbsolutePath)}/**/*.tonto`, {
        ignore: getIgnoredProjectPaths(folderAbsolutePath, manifest),
        nodir: true,
    });
}

export async function buildFolderDocuments(
    dirName: string,
    services: TontoServices,
    options: BuildFolderDocumentsOptions = {}
): Promise<BuiltFolderDocumentsResult> {
    const resolvedDirName = dirName || process.cwd();
    const folderAbsolutePath = path.resolve(resolvedDirName);
    const manifest = options.manifest ?? readOrCreateDefaultTontoManifest(resolvedDirName);
    const allFiles = await getTontoProjectSourceFiles(folderAbsolutePath, manifest);
    const documents = await extractAllDocuments(
        allFiles,
        services,
        builtInLibs,
        options.validation ?? false,
        options.warnOnValidationErrors ?? false
    );
    const models = documents.all.flatMap((doc) => doc.parseResult?.value as Model).toArray();

    return {
        allFiles,
        documents,
        folderAbsolutePath,
        manifest,
        models,
    };
}
