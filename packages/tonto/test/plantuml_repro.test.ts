import { EmptyFileSystem } from "langium";
import { describe, expect, test } from "vitest";
import { URI } from "vscode-uri";
import { generatePlantUML } from "../src/cli/generators/plantuml.generator.js";
import { Model } from "../src/language/generated/ast.js";
import { createTontoServices } from "../src/language/tonto-module.js";

describe("PlantUML Generator Reproduction", () => {
  const services = createTontoServices(EmptyFileSystem);
  const documentBuilder = services.shared.workspace.DocumentBuilder;
  const langiumDocuments = services.shared.workspace.LangiumDocuments;
  const metaData = services.Tonto.LanguageMetaData;

  async function parse(input: string, fileName: string) {
      const uri = URI.parse(`file:///${fileName}${metaData.fileExtensions[0]}`);
      const document = services.shared.workspace.LangiumDocumentFactory.fromString<Model>(input, uri);
      langiumDocuments.addDocument(document);
      return document;
  }

  test("should generate definitions and colors for external elements in relations", async () => {
    // Create People package
    await parse(`
        package People
        kind Person
        role Employee specializes Person
    `, "People");

    // Create University package
    await parse(`
        import People
        package University
        
        kind Organization
        roleMixin Employer
        
        kind University specializes Organization
        
        role UniversityEmployer specializes Employer, University
        
        role UniversityProfessor specializes People.Employee
    `, "University");

    // Create Contracts package
    const contractsDoc = await parse(`
        import People
        import University
        package Contracts

        relator EmploymentContract {
            @mediation
            [1..*] -- [1] People.Employee

            @mediation
            [1..*] -- [1] University.UniversityProfessor
        }
    `, "Contracts");

    // Build all documents to resolve references
    await documentBuilder.build(langiumDocuments.all.toArray());
    
    const model = contractsDoc.parseResult.value as Model;
    
    // We want to generate PlantUML for the Contracts package
    // In this case, the model.module IS the Contracts package
    const contractsPackage = model.module;
    expect(contractsPackage).toBeDefined();
    expect(contractsPackage.name).toBe("Contracts");

    const puml = generatePlantUML(contractsPackage, { showExternalReferences: true });
    
    // Check if EmploymentContract is generated
    expect(puml).toContain(`class "EmploymentContract" <<relator>> #99FF99`);

    // Check if external element People.Employee is generated with correct color/stereotype
    // It should be generated because it is referenced in the relation
    // Employee is a role, so it should be LIGHT_PINK #FFDADD
    expect(puml).toContain(`class "Employee" <<role>> #FFDADD`);

    // Check if external element University.UniversityProfessor is generated
    // UniversityProfessor is a role, so it should be LIGHT_PINK #FFDADD
    expect(puml).toContain(`class "UniversityProfessor" <<role>> #FFDADD`);

    // Check relations
    // External references use longer arrows (-d-- instead of -d-)
    expect(puml).toContain(`"EmploymentContract" "1..*" -d-- "1" "Employee"`);
    expect(puml).toContain(`"EmploymentContract" "1..*" -r-- "1" "UniversityProfessor"`);
  });
});
