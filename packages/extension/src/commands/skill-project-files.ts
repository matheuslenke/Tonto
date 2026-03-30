import * as path from "node:path";
import * as vscode from "vscode";
import {
    buildTontoSkillProjectFiles,
    SKILL_TARGET_OPTIONS,
    type SkillProjectFile,
    type SkillTargetChoice,
    shouldIncludeTemplatePathForSkillTarget,
} from "../../../tonto/src/cli/actions/commands/addSkillCommand.js";

const SKILL_TEMPLATE_PROJECT_NAME = "tonto-skills-temp";

export type { SkillTargetChoice };
export { shouldIncludeTemplatePathForSkillTarget };

export async function promptSkillTargetChoice(): Promise<SkillTargetChoice | undefined> {
    const items = SKILL_TARGET_OPTIONS.map(({ label, value }) => ({
        label,
        value,
    }));
    const selection = await vscode.window.showQuickPick(items, {
        placeHolder: "Which editor or agentic IDE do you use?",
    });

    return selection?.value;
}

export function buildSkillTemplateFiles(): SkillProjectFile[] {
    return buildTontoSkillProjectFiles(SKILL_TEMPLATE_PROJECT_NAME).map((file) => ({
        ...file,
        relativePath: stripLeadingPathSegment(file.relativePath),
    }));
}

function stripLeadingPathSegment(relativePath: string): string {
    const pathSegments = relativePath.split(path.sep);
    return path.join(...pathSegments.slice(1));
}
