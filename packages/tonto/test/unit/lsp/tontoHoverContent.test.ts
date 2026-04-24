import { EmptyFileSystem } from "langium";
import { beforeAll, describe, expect, it } from "vitest";
import { Model, isClassDeclaration } from "../../../src/language/generated/ast.js";
import { getPrimaryContextModuleOrThrow } from "../../../src/language/utils/modelStatements.js";
import { createTontoServices } from "../../../src/language/tonto-module.js";
import { buildClassDeclarationHoverMarkdown } from "../../../src/language/lsp/tonto-hover-content.js";
import { parseHelper } from "../../../src/test/tonto-test.js";

describe("buildClassDeclarationHoverMarkdown", () => {
    const services = createTontoServices(EmptyFileSystem);
    const parse = parseHelper<Model>(services.Tonto);

    beforeAll(async () => {
        await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
    });

    it("explains direct nature derived from the element stereotype", async () => {
        const person = await getClassDeclaration(`
            package Demo

            kind Person
        `, "Person");

        const hover = buildClassDeclarationHoverMarkdown(person);

        expect(hover).toContain("Ultimate sortal that provides an identity principle for functional complexes.");
        expect(hover).toContain("Ontological Nature: `functional-complexes`");
        expect(hover).toContain("`Person` provides its own nature directly: `kind Person` implies `functional-complexes`.");
    });

    it("shows how a role reaches a kind through specialization", async () => {
        const myRole = await getClassDeclaration(`
            package Demo

            kind MyKind
            role MyRole specializes MyKind
        `, "MyRole");

        const hover = buildClassDeclarationHoverMarkdown(myRole);

        expect(hover).toContain("Anti-rigid sortal based on relational contingent conditions.");
        expect(hover).toContain("Ontological Nature: `functional-complexes`");
        expect(hover).toContain("Trace: `MyRole -> MyKind`");
        expect(hover).toContain("Following the specialization chain `MyRole -> MyKind` reaches `kind MyKind`, which provides the `functional-complexes` nature.");
    });

    it("shows a multi-step specialization trace until the ultimate sortal", async () => {
        const manager = await getClassDeclaration(`
            package Demo

            kind Person
            subkind Employee specializes Person
            role Manager specializes Employee
        `, "Manager");

        const hover = buildClassDeclarationHoverMarkdown(manager);

        expect(hover).toContain("Trace: `Manager -> Employee -> Person`");
        expect(hover).toContain("Following the specialization chain `Manager -> Employee -> Person` reaches `kind Person`, which provides the `functional-complexes` nature.");
    });

    it("explains explicit ontological natures declared by non-sortals", async () => {
        const socialEntity = await getClassDeclaration(`
            package Demo

            category SocialEntity of relators
        `, "SocialEntity");

        const hover = buildClassDeclarationHoverMarkdown(socialEntity);

        expect(hover).toContain("Rigid non-sortal that captures essential properties shared by instances of different kinds.");
        expect(hover).toContain("Ontological Nature: `relators`");
        expect(hover).toContain("Declared Restriction: `of relators`");
        expect(hover).toContain("`SocialEntity` declares its own nature directly through `of relators`, which resolves to `relators`.");
    });

    async function getClassDeclaration(input: string, className: string) {
        const document = await parse(input);
        const contextModule = getPrimaryContextModuleOrThrow(document.parseResult.value);
        const classDeclaration = contextModule.declarations.find(
            (declaration) => isClassDeclaration(declaration) && declaration.name === className
        );

        expect(classDeclaration).toBeDefined();
        if (!classDeclaration || !isClassDeclaration(classDeclaration)) {
            throw new Error(`Expected to find class declaration '${className}'.`);
        }

        return classDeclaration;
    }
});
