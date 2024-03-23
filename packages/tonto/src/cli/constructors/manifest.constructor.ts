
import * as fs from "node:fs";
import path from "node:path";
import { Project } from "ontouml-js";
import { TontoManifest, toJson } from "../model/TontoManifest.js";
import { formatForId } from "../utils/replaceWhitespace.js";


export function createTontoManifest(project: Project, destination: string) {
    const manifest: TontoManifest = {
        projectName: formatForId(project.getNameOrId()),
        version: "1.0",
        displayName: project.getNameOrId(),
        license: "",
        publisher: "",
        dependencies: {},
        outFolder: "",
        authors: [],
    };
    const jsonString = toJson(manifest);
    const manifestPath = path.join(destination, "tonto.json");
    fs.writeFileSync(manifestPath, jsonString);
}

interface FilePathData {
    destination: string
    name: string
}

export function customExtractDestinationAndName(filePath: string, destination: string | undefined): FilePathData {
    filePath = filePath.replace(/\.json/, "");
    return {
        destination: destination ?? path.join(path.dirname(filePath), "generated"),
        name: path.basename(filePath),
    };
}