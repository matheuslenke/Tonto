import * as path from "node:path";
import * as vscode from "vscode";
import {
    buildGuidanceProjectFiles,
    GUIDANCE_TARGET_OPTIONS,
    type GuidanceTargetChoice,
    type InitProjectFile,
    shouldIncludeTemplatePathForGuidanceTarget,
} from "../../../tonto/src/cli/actions/commands/initCommand.js";

const GUIDANCE_TEMPLATE_PROJECT_NAME = "tonto-guidances-temp";
const TEXT_ENCODER = new TextEncoder();

export type { GuidanceTargetChoice };
export { shouldIncludeTemplatePathForGuidanceTarget };

export type MaterializeInitProjectFilesOptions = {
    outputChannel?: vscode.OutputChannel;
    filterEntry?: (file: InitProjectFile, relativePath: string) => boolean;
    mapRelativePath?: (file: InitProjectFile) => string | undefined;
};

type ResolvedInitProjectFile = InitProjectFile & {
    targetPath: string;
};

/**
 * Prompts for the editor or agentic IDE-specific guidance format used by the generated project files.
 */
export async function promptGuidanceTargetChoice(): Promise<GuidanceTargetChoice | undefined> {
    const items = GUIDANCE_TARGET_OPTIONS.map(({ label, value }) => ({
        label,
        value,
    }));
    const selection = await vscode.window.showQuickPick(items, {
        placeHolder: "Which editor or agentic IDE do you use?",
    });

    return selection?.value;
}

/**
 * Returns only the guidance-related template files used by the "Add Guidances" command.
 *
 * The underlying CLI helper expects a project root, so this function strips the temporary root
 * folder segment and produces paths that can be written directly into an existing workspace.
 */
export function buildGuidanceTemplateFiles(): InitProjectFile[] {
    return buildGuidanceProjectFiles(GUIDANCE_TEMPLATE_PROJECT_NAME).map((file) => ({
        ...file,
        relativePath: stripLeadingPathSegment(file.relativePath),
    }));
}

/**
 * Writes the file tree returned by `buildInitProjectFiles` into a target folder.
 *
 * Commands can filter paths, rewrite relative paths, and forward an output channel for
 * progress/error logging, which keeps the command handlers focused on command-specific flow.
 */
export async function materializeInitProjectFiles(
    rootFolder: vscode.Uri,
    files: readonly InitProjectFile[],
    options: MaterializeInitProjectFilesOptions = {}
): Promise<void> {
    const createdDirectoryPaths = new Set<string>();
    const resolvedFiles = files.flatMap((file) => {
        const relativePath = options.mapRelativePath?.(file) ?? file.relativePath;
        if (!relativePath) {
            return [];
        }

        if (options.filterEntry && !options.filterEntry(file, relativePath)) {
            return [];
        }

        return [
            {
                ...file,
                relativePath,
                targetPath: path.join(rootFolder.fsPath, relativePath),
            },
        ];
    });

    for (const directoryEntry of resolvedFiles.filter((file): file is ResolvedInitProjectFile => file.type === "dir")) {
        await createDirectory(directoryEntry.targetPath, createdDirectoryPaths, options.outputChannel);
    }

    for (const fileEntry of resolvedFiles.filter((file): file is ResolvedInitProjectFile => file.type === "file")) {
        await createDirectory(path.dirname(fileEntry.targetPath), createdDirectoryPaths, options.outputChannel);
        await writeFile(fileEntry.targetPath, fileEntry.content ?? "", options.outputChannel);
    }
}

async function createDirectory(
    directoryPath: string,
    createdDirectoryPaths: Set<string>,
    outputChannel?: vscode.OutputChannel
): Promise<void> {
    if (createdDirectoryPaths.has(directoryPath)) {
        return;
    }

    const directoryUri = vscode.Uri.file(directoryPath);

    try {
        await vscode.workspace.fs.createDirectory(directoryUri);
        createdDirectoryPaths.add(directoryPath);
        outputChannel?.appendLine(`Created directory: ${directoryPath}`);
    } catch (error) {
        outputChannel?.appendLine(`Failed creating directory ${directoryPath}: ${String(error)}`);
        outputChannel?.show(true);
        throw error;
    }
}

async function writeFile(
    filePath: string,
    content: string,
    outputChannel?: vscode.OutputChannel
): Promise<void> {
    const fileUri = vscode.Uri.file(filePath);

    try {
        await vscode.workspace.fs.writeFile(fileUri, TEXT_ENCODER.encode(content));
        outputChannel?.appendLine(`Wrote file: ${filePath}`);
    } catch (error) {
        outputChannel?.appendLine(`Failed writing file ${filePath}: ${String(error)}`);
        outputChannel?.show(true);
        throw error;
    }
}

function stripLeadingPathSegment(relativePath: string): string {
    const pathSegments = relativePath.split(path.sep);
    return path.join(...pathSegments.slice(1));
}
