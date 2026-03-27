import * as path from "node:path";
import * as vscode from "vscode";

const SELECT_FOLDER_LABEL = "$(folder) Select Folder...";
const DEFAULT_PROJECT_FOLDER_OPEN_LABEL = "Select Tonto Project directory";

export type ProjectFolderPromptOptions = {
    openLabel?: string;
    singleWorkspacePlaceholder?: string;
    multiWorkspacePlaceholder?: string;
};

export type WorkspaceTargetFolderPromptOptions = {
    chooseFolderLabel?: string;
    quickPickPlaceholder?: string;
    openLabel?: string;
};

export type CommandFolderResolutionOptions = {
    uri?: vscode.Uri;
    requireWorkspaceFolder?: boolean;
    missingContextMessage?: string;
    missingWorkspaceMessage?: string;
};

type WorkspaceFolderPickItem = vscode.QuickPickItem & { uri?: vscode.Uri };

/**
 * Returns the first open workspace folder and shows a consistent user-facing error when the
 * command requires a workspace but none is open.
 */
export function getPrimaryWorkspaceFolderOrShowError(
    errorMessage: string,
    outputChannel?: vscode.OutputChannel
): vscode.WorkspaceFolder | undefined {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
        return workspaceFolder;
    }

    outputChannel?.appendLine("No workspace open");
    vscode.window.showErrorMessage(errorMessage);
    outputChannel?.show(true);
    return undefined;
}

/**
 * Prompts the user for the project folder that a command should run against.
 *
 * When workspace folders are open, the picker lets the user reuse a workspace root or browse
 * for a different folder. Without a workspace, the command falls back to a plain folder picker.
 */
export async function promptForProjectFolder(
    options: ProjectFolderPromptOptions = {}
): Promise<vscode.Uri | undefined> {
    const workspaceFolders = vscode.workspace.workspaceFolders ?? [];
    const openLabel = options.openLabel ?? DEFAULT_PROJECT_FOLDER_OPEN_LABEL;

    if (workspaceFolders.length === 1) {
        const workspaceFolder = workspaceFolders[0];
        const useWorkspaceRootLabel = `Use Workspace Root (${workspaceFolder.name})`;
        const selection = await vscode.window.showQuickPick(
            [useWorkspaceRootLabel, SELECT_FOLDER_LABEL],
            {
                placeHolder: options.singleWorkspacePlaceholder ?? "Select how to choose the project folder",
            }
        );

        if (!selection) {
            return undefined;
        }

        if (selection === useWorkspaceRootLabel) {
            return workspaceFolder.uri;
        }

        return promptForFolderFromDialog({ defaultUri: workspaceFolder.uri, openLabel });
    }

    if (workspaceFolders.length > 1) {
        const folderItems: WorkspaceFolderPickItem[] = workspaceFolders.map((workspaceFolder) => ({
            label: `$(root-folder) ${workspaceFolder.name}`,
            uri: workspaceFolder.uri,
        }));
        const selection = await vscode.window.showQuickPick(
            [
                ...folderItems,
                { label: SELECT_FOLDER_LABEL, uri: undefined },
            ],
            {
                placeHolder: options.multiWorkspacePlaceholder ?? "Select the workspace folder or a specific folder",
            }
        );

        if (!selection) {
            return undefined;
        }

        if (selection.uri) {
            return selection.uri;
        }
    }

    return promptForFolderFromDialog({ openLabel });
}

/**
 * Prompts for a destination folder inside or alongside the current workspace root.
 *
 * This is used by scaffold-style commands that default to the workspace root but still allow
 * the user to target a different directory.
 */
export async function promptForWorkspaceTargetFolder(
    workspaceFolder: vscode.WorkspaceFolder,
    options: WorkspaceTargetFolderPromptOptions = {}
): Promise<vscode.Uri | undefined> {
    const chooseFolderLabel = options.chooseFolderLabel ?? "Choose a folder...";
    const selection = await vscode.window.showQuickPick(
        [workspaceFolder.uri.fsPath, chooseFolderLabel],
        {
            placeHolder: options.quickPickPlaceholder ?? "Select folder to generate the project in",
        }
    );

    if (!selection) {
        return undefined;
    }

    if (selection === workspaceFolder.uri.fsPath) {
        return workspaceFolder.uri;
    }

    return promptForFolderFromDialog({
        defaultUri: workspaceFolder.uri,
        openLabel: options.openLabel ?? "Select target folder",
    });
}

/**
 * Resolves the folder that a status-bar or context-sensitive command should operate on.
 *
 * The helper prefers the workspace root when the current file belongs to a workspace. If the
 * file is outside a workspace, it falls back to the file's parent directory unless the caller
 * explicitly requires a workspace-backed command context.
 */
export async function resolveCommandFolderFromContext(
    options: CommandFolderResolutionOptions = {}
): Promise<vscode.Uri | undefined> {
    const contextUri = getCommandContextUri(options.uri);
    if (!contextUri) {
        if (options.missingContextMessage) {
            vscode.window.showErrorMessage(options.missingContextMessage);
        }
        return undefined;
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(contextUri);
    if (workspaceFolder) {
        return workspaceFolder.uri;
    }

    if (options.requireWorkspaceFolder) {
        if (options.missingWorkspaceMessage) {
            vscode.window.showErrorMessage(options.missingWorkspaceMessage);
        }
        return undefined;
    }

    return toDirectoryUri(contextUri);
}

async function promptForFolderFromDialog(options: {
    defaultUri?: vscode.Uri;
    openLabel: string;
}): Promise<vscode.Uri | undefined> {
    const selection = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        defaultUri: options.defaultUri,
        openLabel: options.openLabel,
    });

    return selection?.[0];
}

function getCommandContextUri(uri?: vscode.Uri): vscode.Uri | undefined {
    if (uri) {
        return uri;
    }

    const activeDocumentUri = vscode.window.activeTextEditor?.document.uri;
    if (activeDocumentUri?.scheme === "file") {
        return activeDocumentUri;
    }

    return vscode.workspace.workspaceFolders?.[0]?.uri;
}

async function toDirectoryUri(uri: vscode.Uri): Promise<vscode.Uri> {
    try {
        const stat = await vscode.workspace.fs.stat(uri);
        if (stat.type === vscode.FileType.File) {
            return toParentDirectoryUri(uri);
        }
    } catch {
        // Ignore stat failures and let the caller decide how to proceed with the original URI.
    }

    return uri;
}

function toParentDirectoryUri(uri: vscode.Uri): vscode.Uri {
    if (uri.scheme === "file") {
        return vscode.Uri.file(path.dirname(uri.fsPath));
    }

    return vscode.Uri.joinPath(uri, "..");
}
