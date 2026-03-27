import { NodeFileSystem } from "langium/node";
import { Diagnostic } from "vscode-languageserver-types";
import { createTontoServices } from "../../../index.js";
import { buildFolderDocuments } from "../../utils/buildFolderDocuments.js";
import { readOrCreateDefaultTontoManifest } from "../../utils/readManifest.js";

export const validateCommandLocal = async (dirName: string): Promise<Diagnostic[] | undefined> => {
    const services = createTontoServices({ ...NodeFileSystem }).Tonto;
    const manifest = readOrCreateDefaultTontoManifest(dirName);
    const { documents } = await buildFolderDocuments(dirName, services, {
        manifest,
        validation: true,
    });

    return documents.all
        .flatMap((document) => document.diagnostics)
        .toArray()
        .filter((diagnostic): diagnostic is Diagnostic => diagnostic !== undefined);
};
