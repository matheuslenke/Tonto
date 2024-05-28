import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { parseHelper } from "langium/test";
import { beforeAll, describe, expect, test } from "vitest";
import { isClassDeclaration } from "../../../lib/index.js";
import { Model, isModel } from "../../../src/language/generated/ast.js";
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

describe("Parsing tests", () => {

    test("parse simple model", async () => {
        document = await parse(`
            package Tonto
            class TontoClass
            kind Kind
            collective Collective
            quantity Quantity
            quality Quality
            mode Mode
            intrinsicMode IntrinsicMode
            extrinsicMode ExtrinsicMode
            relator Relator
            type Type
            powertype Powertype
            category Category
            mixin Mixin
            phaseMixin PhaseMixin
            roleMixin RoleMixin
            historicalRoleMixin HistoricalRoleMixin
            subkind Subkind
            phase Phase
            role Role
            historicalRole HistoricalRole
        `);

        // check for absensce of parser errors the classic way:
        //  deacivated, find a much more human readable way below!
        // expect(document.parseResult.parserErrors).toHaveLength(0);

        const classDeclarations = document.parseResult.value?.module.declarations
            .filter(isClassDeclaration)
            .map(c => c.name);
        expect(
            // here we use a (tagged) template expression to create a human readable representation
            //  of the AST part we are interested in and that is to be compared to our expectation;
            // prior to the tagged template expression we check for validity of the parsed document object
            //  by means of the reusable function 'checkDocumentValid()' to sort out (critical) typos first;
            checkDocumentValid(document) || s`
                ClassDeclarations:
                    ${classDeclarations?.join("\n")}
            `
        ).toBe(s`
        ClassDeclarations:
            TontoClass
            Kind
            Collective
            Quantity
            Quality
            Mode
            IntrinsicMode
            ExtrinsicMode
            Relator
            Type
            Powertype
            Category
            Mixin
            PhaseMixin
            RoleMixin
            HistoricalRoleMixin
            Subkind
            Phase
            Role
            HistoricalRole
        `);
    });
});

function checkDocumentValid(document: LangiumDocument): string | undefined {
    return document.parseResult.parserErrors.length && s`
        Parser errors:
          ${document.parseResult.parserErrors.map(e => e.message).join("\n  ")}
    `
        || document.parseResult.value === undefined && "ParseResult is 'undefined'."
        || !isModel(document.parseResult.value) && `Root AST object is a ${document.parseResult.value.$type}, expected a '${Model}'.`
        || undefined;
}
