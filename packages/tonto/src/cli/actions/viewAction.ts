import { NodeFileSystem } from "langium/node";
import { Uri } from "vscode";
import { createTontoServices, Model } from "../../language/index.js";
import { Configuration } from "../../utils/extensionConfig.js";
import { extractAstNode } from "../cli-util.js";
import { extractContent } from "../diagramGenerator.js";
import { generateDiagram } from "../DiagramViewer/diagram.viewer.js";

export const viewCommand = async (fileName: string, domToImgUri: Uri, jsUri: Uri, cssUri: Uri, csp: string, title: string, config: Configuration): Promise<string> => {
    const services = createTontoServices({ ...NodeFileSystem }).Tonto;
    const model = await extractAstNode<Model>(fileName, services);
    const generatedPackages = extractContent(model, fileName?.split("/").pop());

    return generateDiagram(generatedPackages, domToImgUri, jsUri, cssUri, csp, title, config);
};
