import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NodeFileSystem } from "langium/node";
import { afterEach, describe, expect, it } from "vitest";
import { createDefaultTontoManifest, type TontoManifest } from "../../../src/cli/model/grammar/TontoManifest.js";
import { buildFolderDocuments, getTontoProjectSourceFiles } from "../../../src/cli/utils/buildFolderDocuments.js";
import { getPrimaryContextModuleOrThrow } from "../../../src/language/index.js";
import { createTontoServices } from "../../../src/language/tonto-module.js";

const tempDirs: string[] = [];

function createTempProject(manifestOverrides: Partial<TontoManifest> = {}): { manifest: TontoManifest; tempDir: string } {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tonto-build-folder-documents-"));
    tempDirs.push(tempDir);

    const manifest: TontoManifest = {
        ...createDefaultTontoManifest(),
        projectName: "test-project",
        displayName: "Test Project",
        publisher: "test-publisher",
        authors: [],
        ...manifestOverrides,
    };

    fs.writeFileSync(path.join(tempDir, "tonto.json"), JSON.stringify(manifest, null, 2));

    return {
        manifest,
        tempDir,
    };
}

function writeProjectFile(filePath: string, contents: string): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, contents);
}

afterEach(() => {
    for (const tempDir of tempDirs.splice(0)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
});

describe("buildFolderDocuments", () => {
    it("should ignore the configured out folder when collecting source files", async () => {
        const { manifest, tempDir } = createTempProject({ outFolder: "out" });
        const sourceFilePath = path.join(tempDir, "src", "domain.tonto");
        const generatedFilePath = path.join(tempDir, "out", "generated", "domain.tonto");

        writeProjectFile(sourceFilePath, "package Domain\nkind Person\n");
        writeProjectFile(generatedFilePath, "package Generated\nkind Ghost\n");

        const files = await getTontoProjectSourceFiles(tempDir, manifest);

        expect(files).toContain(sourceFilePath);
        expect(files).not.toContain(generatedFilePath);
        expect(files).toHaveLength(1);
    });

    it("should build only source models outside the configured out folder", async () => {
        const { tempDir } = createTempProject({ outFolder: "out" });
        const sourceFilePath = path.join(tempDir, "src", "domain.tonto");
        const generatedFilePath = path.join(tempDir, "out", "generated", "domain.tonto");

        writeProjectFile(sourceFilePath, "package Domain\nkind Person\n");
        writeProjectFile(generatedFilePath, "package Generated\nkind Ghost\n");

        const services = createTontoServices({ ...NodeFileSystem }).Tonto;
        const { allFiles, models } = await buildFolderDocuments(tempDir, services);
        const modelNames = models.map((model) => getPrimaryContextModuleOrThrow(model).name);

        expect(allFiles).toContain(sourceFilePath);
        expect(allFiles).not.toContain(generatedFilePath);
        expect(modelNames).toContain("Domain");
        expect(modelNames).not.toContain("Generated");
    });

    it("should keep project files when the manifest out folder is blank", async () => {
        const { manifest, tempDir } = createTempProject({ outFolder: "" });
        const sourceFilePath = path.join(tempDir, "domain.tonto");

        writeProjectFile(sourceFilePath, "package Domain\nkind Person\n");

        const files = await getTontoProjectSourceFiles(tempDir, manifest);

        expect(files).toContain(sourceFilePath);
        expect(files).toHaveLength(1);
    });
});
