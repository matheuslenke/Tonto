import { CompositeGeneratorNode } from "langium/generate";
import { NodeFileSystem } from "langium/node";
import { createTontoServices } from "../../../language/tonto-module.js";
import { ModularGeneratorContext, parseProjectModular } from "../../utils/parseProjectModular.js";
import { buildFolderDocuments } from "../../utils/buildFolderDocuments.js";
import { readOrCreateDefaultTontoManifest } from "../../utils/readManifest.js";
import {
    ErrorGufoResultResponse,
    GufoResultResponse,
    TransformTontoToGufo,
    createGufoErrorResponse,
} from "../../main.js";

export const transformToGufoCommand = async (
    dirName: string,
    label?: string,
    description?: string
): Promise<GufoResultResponse | ErrorGufoResultResponse> => {
    const services = createTontoServices({ ...NodeFileSystem }).Tonto;

    try {
        const manifest = readOrCreateDefaultTontoManifest(dirName);
        const { folderAbsolutePath, models } = await buildFolderDocuments(dirName, services, { manifest });

        const context: ModularGeneratorContext = {
            models,
            fileNode: new CompositeGeneratorNode(),
            manifest,
            folderAbsolutePath,
            label,
            description,
        };

        const project = parseProjectModular(context);

        return await TransformTontoToGufo(project);
    } catch (error) {
        return createGufoErrorResponse("Failed to prepare model for gUFO transformation", { error });
    }
};

export function isGufoResultResponse(value: unknown): value is GufoResultResponse {
    return typeof value === "object"
        && value !== null
        && "result" in value
        && typeof value.result === "string";
}
