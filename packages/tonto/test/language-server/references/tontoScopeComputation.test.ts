import { EmptyFileSystem } from "langium";
import { describe, expect, it } from "vitest";
import { URI } from "vscode-uri";
import { Model } from "../../../src/language/generated/ast.js";
import { getPrimaryContextModuleOrThrow } from "../../../src/language/index.js";
import { createTontoServices } from "../../../src/language/tonto-module.js";

function createTestEnvironment() {
  const services = createTontoServices(EmptyFileSystem);
  const documentBuilder = services.shared.workspace.DocumentBuilder;
  const documentFactory = services.shared.workspace.LangiumDocumentFactory;
  const langiumDocuments = services.shared.workspace.LangiumDocuments;
  const fileExtension = services.Tonto.LanguageMetaData.fileExtensions[0];

  function createDocument(input: string, fileName: string) {
    const uri = URI.parse(`file:///${fileName}${fileExtension}`);
    const document = documentFactory.fromString<Model>(input, uri);
    langiumDocuments.addDocument(document);
    return document;
  }

  return {
    createDocument,
    documentBuilder,
  };
}

describe("TontoScopeComputation", () => {
  it("exports qualified names for declarations in global packages", async () => {
    const { createDocument, documentBuilder } = createTestEnvironment();
    const primitivesDocument = createDocument(`
      global package primitives
      datatype UUID
    `, "primitives");
    const usersDocument = createDocument(`
      package users
      kind User {
        id : primitives.UUID
      }
    `, "users");

    await documentBuilder.build([primitivesDocument, usersDocument]);

    const importedTypeReference = usersDocument.references.find(
      (reference) => reference.$refText === "primitives.UUID"
    );

    expect(importedTypeReference?.ref?.$type).toBe("DataType");
    expect(importedTypeReference?.$nodeDescription?.documentUri.toString()).toBe(
      primitivesDocument.uri.toString()
    );
  });

  it("keeps imported declarations tied to their source document", async () => {
    const { createDocument, documentBuilder } = createTestEnvironment();
    const peopleDocument = createDocument(`
      package People
      kind Person
    `, "People");
    const universityDocument = createDocument(`
      import People
      package University

      role Professor specializes People.Person
    `, "University");

    await documentBuilder.build([peopleDocument, universityDocument]);

    const importedClassReference = universityDocument.references.find(
      (reference) => reference.$refText === "People.Person"
    );

    expect(importedClassReference?.ref?.$type).toBe("ClassDeclaration");
    expect(importedClassReference?.$nodeDescription?.documentUri.toString()).toBe(
      peopleDocument.uri.toString()
    );
  });

  it("adds generalization sets to the primary module local scope", async () => {
    const { createDocument, documentBuilder } = createTestEnvironment();
    const document = createDocument(`
      package ScopePackage
      kind Person
      subkind Student specializes Person
      subkind Teacher specializes Person
      genset PersonGenset {
        general Person
        specifics Student, Teacher
      }
    `, "ScopePackage");

    await documentBuilder.build([document]);

    expect(document.parseResult.parserErrors).toHaveLength(0);

    const contextModule = getPrimaryContextModuleOrThrow(document.parseResult.value);
    const scopeNames = document.precomputedScopes?.get(contextModule).map((description) => description.name) ?? [];

    expect(scopeNames).toContain("PersonGenset");
    expect(scopeNames).toContain("ScopePackage.PersonGenset");
  });
});
