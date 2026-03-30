import { select } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { tontoOntologySkillTemplateFiles } from "../../templates/skills/tonto-ontology.js";

export type SkillProjectFile = { type: "file" | "dir"; relativePath: string; content?: string };

export const SKILL_TARGET_OPTIONS = [
    {
        label: "Cursor",
        value: "cursor",
        description: "Install the Tonto skill under .cursor/skills/tonto-ontology",
    },
    {
        label: "VS Code",
        value: "vscode",
        description: "Install the Tonto skill under .github/skills/tonto-ontology",
    },
    {
        label: "Codex",
        value: "codex",
        description: "Install the Tonto skill under .codex/skills/tonto-ontology",
    },
    {
        label: "Claude Code",
        value: "claude",
        description: "Install the Tonto skill under .claude/skills/tonto-ontology",
    },
    {
        label: "Google (Gemini / Antigravity)",
        value: "google",
        description: "Install the Tonto skill under .agents/skills/tonto-ontology",
    },
    {
        label: "All",
        value: "all",
        description: "Install the Tonto skill for every supported editor and agentic IDE",
    },
] as const;

export type SkillTargetChoice = (typeof SKILL_TARGET_OPTIONS)[number]["value"];

type SkillTemplateEntry = SkillProjectFile & {
    target: Exclude<SkillTargetChoice, "all">;
};

const SKILL_FOLDER_NAME = "tonto-ontology";
const CURSOR_SKILL_DIR = path.join(".cursor", "skills", SKILL_FOLDER_NAME);
const VSCODE_SKILL_DIR = path.join(".github", "skills", SKILL_FOLDER_NAME);
const CODEX_SKILL_DIR = path.join(".codex", "skills", SKILL_FOLDER_NAME);
const CLAUDE_SKILL_DIR = path.join(".claude", "skills", SKILL_FOLDER_NAME);
const GOOGLE_SKILL_DIR = path.join(".agents", "skills", SKILL_FOLDER_NAME);

function buildSkillTemplateEntries(
    baseFolder: string,
    target: Exclude<SkillTargetChoice, "all">
): SkillTemplateEntry[] {
    const directoryPaths = new Set<string>([baseFolder]);

    for (const file of tontoOntologySkillTemplateFiles) {
        const directoryName = path.dirname(file.relativePath);
        if (directoryName !== ".") {
            directoryPaths.add(path.join(baseFolder, directoryName));
        }
    }

    return [
        ...Array.from(directoryPaths, (relativePath) => ({
            type: "dir" as const,
            relativePath,
            target,
        })),
        ...tontoOntologySkillTemplateFiles.map(({ relativePath, content }) => ({
            type: "file" as const,
            relativePath: path.join(baseFolder, relativePath),
            content,
            target,
        })),
    ];
}

const SKILL_TEMPLATE_ENTRIES: readonly SkillTemplateEntry[] = [
    ...buildSkillTemplateEntries(CURSOR_SKILL_DIR, "cursor"),
    ...buildSkillTemplateEntries(VSCODE_SKILL_DIR, "vscode"),
    ...buildSkillTemplateEntries(CODEX_SKILL_DIR, "codex"),
    ...buildSkillTemplateEntries(CLAUDE_SKILL_DIR, "claude"),
    ...buildSkillTemplateEntries(GOOGLE_SKILL_DIR, "google"),
];

type AddSkillCommandOptions = {
    target?: string;
};

export function buildTontoSkillProjectFiles(projectName: string): SkillProjectFile[] {
    return SKILL_TEMPLATE_ENTRIES.map(({ target: _target, ...entry }) => ({
        ...entry,
        relativePath: joinProjectRelativePath(projectName, entry.relativePath),
    }));
}

export function shouldIncludeTemplatePathForSkillTarget(
    skillTarget: SkillTargetChoice,
    relativePath: string
): boolean {
    if (skillTarget === "all") {
        return true;
    }

    if (isCursorSkillPath(relativePath)) {
        return skillTarget === "cursor";
    }

    if (isVscodeSkillPath(relativePath)) {
        return skillTarget === "vscode";
    }

    if (isCodexSkillPath(relativePath)) {
        return skillTarget === "codex";
    }

    if (isClaudeSkillPath(relativePath)) {
        return skillTarget === "claude";
    }

    if (isGoogleSkillPath(relativePath)) {
        return skillTarget === "google";
    }

    return true;
}

export function addSkillCommand(): Command {
    const addSkill = new Command("add-skill");
    addSkill
        .description("Add the Tonto ontology skill to a project")
        .argument("<dir>", "Directory of the Tonto project")
        .option("-t, --target <target>", "Target IDE (codex, claude, google, all)")
        .action(addSkillAction);
    return addSkill;
}

async function addSkillAction(projectDirectory: string, options: AddSkillCommandOptions): Promise<void> {
    const projectPath = path.resolve(projectDirectory);
    if (!fs.existsSync(projectPath) || !fs.statSync(projectPath).isDirectory()) {
        throw new Error(`Project directory does not exist: ${projectPath}`);
    }

    const skillTarget = options.target
        ? parseSkillTargetOption(options.target)
        : await promptSkillTargetChoice();

    if (!skillTarget) {
        console.log(chalk.yellow("Skill installation cancelled."));
        return;
    }

    materializeSelectedSkillFiles(projectPath, skillTarget);
    console.log(chalk.green("Tonto skill installed successfully."));
}

async function promptSkillTargetChoice(): Promise<SkillTargetChoice | undefined> {
    return select({
        message: "Which editor or agentic IDE do you use?",
        choices: SKILL_TARGET_OPTIONS.map(({ label, value, description }) => ({
            name: label,
            value,
            description,
        })),
    });
}

function parseSkillTargetOption(value: string): SkillTargetChoice {
    const normalizedValue = value.trim().toLowerCase();
    if (
        normalizedValue === "cursor" ||
        normalizedValue === "vscode" ||
        normalizedValue === "codex" ||
        normalizedValue === "claude" ||
        normalizedValue === "google" ||
        normalizedValue === "all"
    ) {
        return normalizedValue;
    }

    throw new Error(`Unsupported skill target '${value}'. Use cursor, vscode, codex, claude, google, or all.`);
}

function materializeSelectedSkillFiles(projectPath: string, skillTarget: SkillTargetChoice): void {
    const skillFiles = buildTontoSkillProjectFiles("").filter((file) =>
        shouldIncludeTemplatePathForSkillTarget(skillTarget, file.relativePath)
    );
    const createdDirectoryPaths = new Set<string>();

    console.log(chalk.blue(`Creating Tonto skill files for target '${skillTarget}'`));

    for (const directoryEntry of skillFiles.filter((file): file is SkillProjectFile & { type: "dir" } => file.type === "dir")) {
        ensureDirectorySync(path.join(projectPath, directoryEntry.relativePath), createdDirectoryPaths);
    }

    for (const fileEntry of skillFiles.filter((file): file is SkillProjectFile & { type: "file" } => file.type === "file")) {
        const targetPath = path.join(projectPath, fileEntry.relativePath);
        ensureDirectorySync(path.dirname(targetPath), createdDirectoryPaths);
        fs.writeFileSync(targetPath, fileEntry.content ?? "", "utf-8");
        console.log(chalk.green(`Created ${fileEntry.relativePath}`));
    }
}

function joinProjectRelativePath(projectName: string, relativePath: string): string {
    return projectName ? path.join(projectName, relativePath) : relativePath;
}

function ensureDirectorySync(directoryPath: string, createdDirectoryPaths: Set<string>): void {
    if (createdDirectoryPaths.has(directoryPath)) {
        return;
    }

    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }

    createdDirectoryPaths.add(directoryPath);
}

function isCursorSkillPath(relativePath: string): boolean {
    return pathContainsDirectory(relativePath, ".cursor");
}

function isVscodeSkillPath(relativePath: string): boolean {
    return pathContainsDirectory(relativePath, ".github");
}

function isCodexSkillPath(relativePath: string): boolean {
    return pathContainsDirectory(relativePath, ".codex");
}

function isClaudeSkillPath(relativePath: string): boolean {
    return pathContainsDirectory(relativePath, ".claude");
}

function isGoogleSkillPath(relativePath: string): boolean {
    return pathContainsDirectory(relativePath, ".agents");
}

function pathContainsDirectory(relativePath: string, directoryName: string): boolean {
    const normalizedPath = normalizeRelativePath(relativePath);
    return (
        normalizedPath === directoryName ||
        normalizedPath.startsWith(`${directoryName}/`) ||
        normalizedPath.includes(`/${directoryName}/`) ||
        normalizedPath.endsWith(`/${directoryName}`)
    );
}

function normalizeRelativePath(relativePath: string): string {
    return relativePath.split(path.sep).join("/");
}
