import { EmptyFileSystem, type LangiumDocument } from "langium";
import { CompositeGeneratorNode, toString } from "langium/generate";
import { parseHelper } from "langium/test";
import { Project, serializationUtils } from "ontouml-js";
import { beforeAll, describe, expect, it } from "vitest";
import { constructClassElement } from "../../../src/cli/constructors/classElement.constructor.js";
import { serializeProject } from "../../../src/cli/utils/serializeProject.js";
import { parseProject } from "../../../src/cli/utils/parseProject.js";
import { Model } from "../../../src/language/index.js";
import { createTontoServices } from "../../../src/language/tonto-module.js";

const modelText = `
    package Tonto
    kind Person {
        [1] -- associates -- [*] ({ ordered } contacts) Person
    }
    kind Professor specializes Person {
        [1] -- colleagues -- [*] ({ subsets contacts, redefines contacts } peers) Professor specializes associates
    }
`;

let services: ReturnType<typeof createTontoServices>;
let parse: ReturnType<typeof parseHelper<Model>>;

beforeAll(async () => {
    services = createTontoServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.Tonto);
    await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

describe("Relation round-trip support", () => {
    it("should map relation specialization and end overrides into ontouml-js", async () => {
        const project = await buildProject(modelText);
        const associates = project.getAllRelations().find((relation) => relation.getName() === "associates");
        const colleagues = project.getAllRelations().find((relation) => relation.getName() === "colleagues");

        expect(associates).toBeDefined();
        expect(colleagues).toBeDefined();
        expect(colleagues?.getGeneralizationsWhereSpecific()).toHaveLength(1);
        expect(colleagues?.getGeneralizationsWhereSpecific()[0]?.getGeneralRelation()).toBe(associates);
        expect(colleagues?.getTargetEnd().subsettedProperties).toEqual([associates?.getTargetEnd()]);
        expect(colleagues?.getTargetEnd().redefinedProperties).toEqual([associates?.getTargetEnd()]);
    });

    it("should serialize relation-end overrides as references and recreate them on import", async () => {
        const project = await buildProject(modelText);
        const associates = project.getAllRelations().find((relation) => relation.getName() === "associates");
        const colleagues = project.getAllRelations().find((relation) => relation.getName() === "colleagues");

        if (!associates || !colleagues) {
            throw new Error("Expected both relations to be generated");
        }

        const serialized = serializeProject(project);
        const serializedPeers = findSerializedPropertyByName(JSON.parse(serialized), "peers");

        expect(serializedPeers?.subsettedProperties).toEqual([
            { type: "Property", id: associates.getTargetEnd().id },
        ]);
        expect(serializedPeers?.redefinedProperties).toEqual([
            { type: "Property", id: associates.getTargetEnd().id },
        ]);

        const importedProject = serializationUtils.parse(serialized, true) as Project;
        const professor = importedProject.getAllClasses().find((classifier) => classifier.getName() === "Professor");
        if (!professor) {
            throw new Error("Expected imported project to contain Professor");
        }

        const fileNode = new CompositeGeneratorNode();
        constructClassElement(professor, fileNode);
        const rendered = toString(fileNode);

        expect(rendered).toContain("specializes Person.associates");
        expect(rendered).toContain("subsets Person.associates.contacts");
        expect(rendered).toContain("redefines Person.associates.contacts");
    });
});

async function buildProject(input: string): Promise<Project> {
    const document = await parse(input);
    throwIfParserHasErrors(document);
    return parseProject({
        model: document.parseResult.value,
        name: "Relation Round Trip",
    });
}

function throwIfParserHasErrors(document: LangiumDocument<Model>) {
    if (document.parseResult.parserErrors.length > 0) {
        throw new Error(document.parseResult.parserErrors.map((error) => error.message).join("\n"));
    }

    if (!document.parseResult.value) {
        throw new Error("Expected parse result to contain a model");
    }
}

function findSerializedPropertyByName(element: unknown, name: string): Record<string, unknown> | undefined {
    if (!element || typeof element !== "object") {
        return undefined;
    }

    const serializedElement = element as Record<string, unknown>;
    if (serializedElement.type === "Property" && serializedElement.name === name) {
        return serializedElement;
    }

    for (const value of Object.values(serializedElement)) {
        if (Array.isArray(value)) {
            for (const item of value) {
                const match = findSerializedPropertyByName(item, name);
                if (match) {
                    return match;
                }
            }
            continue;
        }

        const match = findSerializedPropertyByName(value, name);
        if (match) {
            return match;
        }
    }

    return undefined;
}
