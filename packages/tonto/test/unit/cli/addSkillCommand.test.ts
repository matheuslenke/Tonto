import path from "node:path";
import { describe, expect, it } from "vitest";
import {
    buildTontoSkillProjectFiles,
    shouldIncludeTemplatePathForSkillTarget,
} from "../../../src/cli/actions/commands/addSkillCommand.js";

describe("buildTontoSkillProjectFiles", () => {
    it("includes the Tonto skill tree for every supported IDE folder", () => {
        const skillPaths = buildTontoSkillProjectFiles("demo-project").map((file) => file.relativePath);

        expect(skillPaths).toContain(path.join("demo-project", ".cursor", "skills", "tonto-ontology"));
        expect(skillPaths).toContain(
            path.join("demo-project", ".cursor", "skills", "tonto-ontology", "references", "documentation.md")
        );
        expect(skillPaths).toContain(path.join("demo-project", ".github", "skills", "tonto-ontology"));
        expect(skillPaths).toContain(path.join("demo-project", ".github", "skills", "tonto-ontology", "SKILL.md"));
        expect(skillPaths).toContain(path.join("demo-project", ".codex", "skills", "tonto-ontology"));
        expect(skillPaths).toContain(path.join("demo-project", ".codex", "skills", "tonto-ontology", "SKILL.md"));
        expect(skillPaths).toContain(
            path.join("demo-project", ".claude", "skills", "tonto-ontology", "references", "extending.md")
        );
        expect(skillPaths).toContain(
            path.join("demo-project", ".agents", "skills", "tonto-ontology", "references", "terminology.md")
        );
    });
});

describe("shouldIncludeTemplatePathForSkillTarget", () => {
    const withinProject = (relativePath: string): string => path.join("demo-project", relativePath);

    it("filters project-prefixed skill paths correctly", () => {
        expect(
            shouldIncludeTemplatePathForSkillTarget(
                "cursor",
                withinProject(path.join(".cursor", "skills", "tonto-ontology", "SKILL.md"))
            )
        ).toBe(true);
        expect(
            shouldIncludeTemplatePathForSkillTarget(
                "cursor",
                withinProject(path.join(".github", "skills", "tonto-ontology", "SKILL.md"))
            )
        ).toBe(false);
        expect(
            shouldIncludeTemplatePathForSkillTarget(
                "vscode",
                withinProject(path.join(".github", "skills", "tonto-ontology", "SKILL.md"))
            )
        ).toBe(true);
        expect(
            shouldIncludeTemplatePathForSkillTarget(
                "codex",
                withinProject(path.join(".codex", "skills", "tonto-ontology", "SKILL.md"))
            )
        ).toBe(true);
        expect(
            shouldIncludeTemplatePathForSkillTarget(
                "codex",
                withinProject(path.join(".claude", "skills", "tonto-ontology", "SKILL.md"))
            )
        ).toBe(false);
        expect(
            shouldIncludeTemplatePathForSkillTarget(
                "claude",
                withinProject(path.join(".claude", "skills", "tonto-ontology", "SKILL.md"))
            )
        ).toBe(true);
        expect(
            shouldIncludeTemplatePathForSkillTarget(
                "google",
                withinProject(path.join(".agents", "skills", "tonto-ontology", "SKILL.md"))
            )
        ).toBe(true);
    });

    it("keeps unrelated project files", () => {
        expect(shouldIncludeTemplatePathForSkillTarget("codex", withinProject("README.md"))).toBe(true);
    });
});
