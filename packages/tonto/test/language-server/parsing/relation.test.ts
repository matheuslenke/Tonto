import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { parseHelper } from "langium/test";
import { beforeAll, describe, expect, test } from "vitest";
import { isClassDeclaration, isElementRelation } from "../../../lib/index.js";
import { Cardinality, Model, isModel } from "../../../src/language/generated/ast.js";
import { createTontoServices } from "../../../src/language/tonto-module.js";

let services: ReturnType<typeof createTontoServices>;
let parse:    ReturnType<typeof parseHelper<Model>>;
let document: LangiumDocument<Model> | undefined;

beforeAll(async () => {
    services = createTontoServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.Tonto);

    // Required for built-in libraries like Tonto types
    await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

describe("Parsing tests of Relations", () => {

    test("parse internal and external relations", async () => {
        document = await parse(`
            package Tonto
            kind FirstKind
            kind SecondKind {
                -- internalRelation1 -- FirstKind
            }
            relation FirstKind -- relation1 -- SecondKind
            relation FirstKind [1] -- relation2 -- [1] SecondKind
        `);

        // check for absensce of parser errors the classic way:
        //  deacivated, find a much more human readable way below!
        // expect(document.parseResult.parserErrors).toHaveLength(0);
        const externalRelations = document.parseResult.value?.module.declarations
            .filter(isElementRelation)
            .map(r => r.name ?? "");
        const relations = document.parseResult.value?.module.declarations
        .filter(isClassDeclaration)
        .flatMap(item => item.references)
        .map(c => c.$container.name + "." + (c.name ?? "unamed"));
        expect(
            // here we use a (tagged) template expression to create a human readable representation
            //  of the AST part we are interested in and that is to be compared to our expectation;
            // prior to the tagged template expression we check for validity of the parsed document object
            //  by means of the reusable function 'checkDocumentValid()' to sort out (critical) typos first;
            checkDocumentValid(document) || s`
                External Relations:
                    ${externalRelations?.join("\n")}
                Internal Relations:
                    ${relations?.join("\n")}
            `
        ).toBe(s`
            External Relations:
                relation1
                relation2
            Internal Relations:
                SecondKind.internalRelation1
        `);
    });

    test("Parse info inside relation", async () => {
        document = await parse(`
            package Tonto
            kind Person
            kind Doctor
            relation Doctor (endA) [2] -- treats -- [2] (endB) Person
            relation Doctor (endA) -- treats2 -- [2] (endB) Person
            relation Doctor (endA) [2] -- treats3 -- (endB) Person
            relation Doctor (endA) [1..2] -- treats4 -- [1..*] (endB) Person
        `);
        const externalRelations = document.parseResult.value?.module.declarations
            .filter(isElementRelation)
            .map(r => `${r.name} [${cardinalityToString(r.firstCardinality)}] [${cardinalityToString(r.secondCardinality)}]` ?? "");

        expect(
            checkDocumentValid(document) || s`
                Relations:
                    ${externalRelations?.join("\n")}
            `
        ).toBe(s`
            Relations:
                treats [2] [2]
                treats2 [] [2]
                treats3 [2] []
                treats4 [1..2] [1..*]
        `);
    });
});

function cardinalityToString(cardinality: Cardinality | undefined): string {
    if (!cardinality) {
        return "";
    }
    if (cardinality.lowerBound === cardinality.upperBound) {
        return `${cardinality.lowerBound}`;
    }
    if (cardinality.lowerBound && cardinality.upperBound) {
        return `${cardinality.lowerBound}..${cardinality.upperBound}`;
    }
    if (cardinality.lowerBound) {
        return `${cardinality.lowerBound}`;
    }
    if (cardinality.upperBound) {
        return `${cardinality.upperBound}`;
    }
    return "";
}

function checkDocumentValid(document: LangiumDocument): string | undefined {
    return document.parseResult.parserErrors.length && s`
        Parser errors:
          ${document.parseResult.parserErrors.map(e => e.message).join("\n  ")}
    `
        || document.parseResult.value === undefined && "ParseResult is 'undefined'."
        || !isModel(document.parseResult.value) && `Root AST object is a ${document.parseResult.value.$type}, expected a '${Model}'.`
        || undefined;
}
