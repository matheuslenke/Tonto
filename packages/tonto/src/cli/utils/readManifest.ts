import * as fs from "node:fs";
import * as path from "node:path";
import { TontoManifest, createDefaultTontoManifest } from "../model/grammar/TontoManifest.js";

export function readTontoManifest(dirName: string): TontoManifest | undefined {
    let manifest: TontoManifest;

    const folderAbsolutePath = path.resolve(dirName);

    if (!fs.existsSync(path.join(folderAbsolutePath, "tonto.json"))) {
        return undefined;
    } else {
        const filePath = path.join(dirName, "tonto.json");

        const tontoManifestContent = fs.readFileSync(filePath, "utf-8");
        manifest = JSON.parse(tontoManifestContent);
    }
    return manifest;
}

export function readOrCreateDefaultTontoManifest(dirName: string): TontoManifest {
    let manifest: TontoManifest;

    const folderAbsolutePath = path.resolve(dirName);

    if (!fs.existsSync(path.join(folderAbsolutePath, "tonto.json"))) {
        manifest = createDefaultTontoManifest();
    } else {
        const filePath = path.join(dirName, "tonto.json");

        const tontoManifestContent = fs.readFileSync(filePath, "utf-8");
        manifest = JSON.parse(tontoManifestContent);
    }
    return manifest;
}
