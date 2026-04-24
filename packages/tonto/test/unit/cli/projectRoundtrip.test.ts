import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NodeFileSystem } from "langium/node";
import { CompositeGeneratorNode, toString } from "langium/generate";
import { MultilingualText, Project } from "ontouml-js";
import { afterEach, describe, expect, it } from "vitest";
import { importCommand } from "../../../src/cli/actions/commands/importCommand.js";
import { generateModularCommand } from "../../../src/cli/actions/commands/generateCommand.js";
import { createTontoPackage } from "../../../src/cli/constructors/package.constructor.js";
import { createDefaultTontoManifest, type TontoManifest } from "../../../src/cli/model/grammar/TontoManifest.js";
import { buildFolderDocuments } from "../../../src/cli/utils/buildFolderDocuments.js";
import { serializeProject } from "../../../src/cli/utils/serializeProject.js";
import { createTontoServices } from "../../../src/language/tonto-module.js";

const tempDirs: string[] = [];

describe("project round-trip support", () => {
    afterEach(() => {
        for (const tempDir of tempDirs.splice(0)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it("should preserve multilingual metadata, specializations, and source imports across Tonto -> JSON -> Tonto", async () => {
        const { manifest, tempDir } = createTempProject({ projectName: "roundtrip-project" });

        writeProjectFile(
            path.join(tempDir, "Datatypes.tonto"),
            `
package Datatypes

datatype PhoneNumber
`.trim()
        );

        writeProjectFile(
            path.join(tempDir, "University.tonto"),
            `
package University

kind University
`.trim()
        );

        writeProjectFile(
            path.join(tempDir, "Dog.tonto"),
            `
package Dog

kind Dog
`.trim()
        );

        writeProjectFile(
            path.join(tempDir, "Person.tonto"),
            `
import Datatypes
import University
import Dog

package Person

kind Person {
    label {
        @en "Person"
        @pt-br "Pessoa"
        @fr "Personne"
    }
    description {
        @en "A human being, an individual."
        @pt-br "Um ser humano, um indivíduo."
        @fr "Un être humain, un individu."
    }

    age: number
    phoneNumber: Datatypes.PhoneNumber
    birthDate: date
    firstName: string

    [1] -- hasPet -- [0..*] Dog.Dog
    [0..*] -- knows -- [0..*] (knownPerson) Person
}

phase Child specializes Person {
    label {
        @en "Child"
        @pt-br "Criança"
        @fr "Enfant"
    }
    description {
        @en "A person who is not yet an adult."
        @pt-br "Uma pessoa que ainda não é adulta."
        @fr "Une personne qui n'est pas encore adulte."
    }
}
phase Teenager specializes Person {
    label {
        @en "Teenager"
        @pt-br "Adolescente"
        @fr "Adolescent"
    }
    description {
        @en "A person typically between the ages of 13 and 19."
        @pt-br "Uma pessoa geralmente entre 13 e 19 anos de idade."
        @fr "Une personne généralement âgée de 13 à 19 ans."
    }
}
phase Adult specializes Person {
    label {
        @en "Adult"
        @pt-br "Adulto"
        @fr "Adulte"
    }
    description {
        @en "A person who has reached full physical and intellectual maturity."
        @pt-br "Uma pessoa que atingiu a maturidade física e intelectual completa."
        @fr "Une personne qui a atteint sa pleine maturité physique et intellectuelle."
    }
}

role UniversityStudent specializes Person {
    label {
        @en "University Student"
        @pt-br "Estudante Universitário"
        @fr "Étudiant Universitaire"
    }
    description {
        @en "A person enrolled in a university-level educational program."
        @pt-br "Uma pessoa matriculada em um programa educacional de nível universitário."
        @fr "Une personne inscrite à un programme d'enseignement universitaire."
    }

    [0..*] -- studyPartners -- [0..*] ({ subsets Person.Person.knows.knownPerson } partners) UniversityStudent
}
role FormerStudent specializes UniversityStudent {
    label {
        @en "Former Student"
        @pt-br "Ex-Aluno"
        @fr "Ancien Étudiant"
    }
    description {
        @en "A person who was previously enrolled as a University Student but is no longer active."
        @pt-br "Uma pessoa que foi anteriormente matriculada como estudante universitário, mas não está mais ativa."
        @fr "Une personne qui était auparavant inscrite en tant qu'étudiant universitaire mais n'est plus active."
    }
}
role ActiveStudent specializes UniversityStudent {
    label {
        @en "Active Student"
        @pt-br "Estudante Ativo"
        @fr "Étudiant Actif"
    }
    description {
        @en "A person currently enrolled and actively participating as a University Student."
        @pt-br "Uma pessoa atualmente matriculada e participando ativamente como estudante universitário."
        @fr "Une personne actuellement inscrite et participant activement en tant qu'étudiant universitaire."
    }
}

role Employee specializes Person {
    label {
        @en "Employee"
        @pt-br "Empregado"
        @fr "Employé"
    }
    description {
        @en "A person hired to work for another person or for a business."
        @pt-br "Uma pessoa contratada para trabalhar para outra pessoa ou para uma empresa."
        @fr "Une personne embauchée pour travailler pour une autre personne ou pour une entreprise."
    }

    [0..*] -- colleagues -- [0..*] Employee specializes knows
    [0..*] -- specificColleagues -- [0..*] (specificColleague) Employee
}

role UniversityProfessor specializes Employee {
    label {
        @en "University Professor"
        @pt-br "Professor Universitário"
        @fr "Professeur d'Université"
    }
    description {
        @en "An employee who teaches and conducts research at a university."
        @pt-br "Um empregado que ensina e conduz pesquisa em uma universidade."
        @fr "Un employé qui enseigne et mène des recherches dans une université."
    }
}

role Professor specializes Employee {
    label {
        @en "Professor"
        @pt-br "Professor"
        @fr "Professeur"
    }
    description {
        @en "A senior academic rank at universities and other tertiary education and research institutions."
        @pt-br "Um cargo acadêmico sênior em universidades e outras instituições de ensino superior e pesquisa."
        @fr "Un rang universitaire supérieur dans les universités et autres établissements d'enseignement supérieur et de recherche."
    }

    [0..*] -- closeColleagues -- [0..*] ({ redefines Person.Employee.specificColleagues.specificColleague } specificColleagues) Professor
}
`.trim()
        );

        const generatedJsonPath = await generateModularCommand(tempDir);
        expect(generatedJsonPath).toBe(path.join(tempDir, "out/roundtrip-project.json"));

        const importedDir = path.join(tempDir, "imported");
        const importResult = await importCommand({
            fileName: generatedJsonPath ?? "",
            destination: importedDir,
        });

        expect(importResult.success).toBe(true);
        expect(importResult.filePath).toBeDefined();

        const personFilePath = path.join(importResult.filePath ?? "", "Person", "Person.tonto");
        const personSource = fs.readFileSync(personFilePath, "utf8");

        expect(personSource).toContain("import Datatypes");
        expect(personSource).toContain("import University");
        expect(personSource).toContain("import Dog");
        expect(personSource).toContain('@pt-br "Pessoa"');
        expect(personSource).toContain('@fr "Personne"');
        expect(personSource).toContain('@en "A human being, an individual."');
        expect(personSource).toContain("phoneNumber : Datatypes.PhoneNumber");
        expect(personSource).toMatch(/\[1\]\s*-- hasPet --\s*\[0\.\.\*\]\s*Dog\.Dog/);
        expect(personSource).toContain("phase Child specializes Person");
        expect(personSource).toContain("role UniversityStudent specializes Person");
        expect(personSource).toContain("role FormerStudent specializes UniversityStudent");
        expect(personSource).toContain("role Professor specializes Employee");
        expect(personSource).toContain("subsets Person.knows.knownPerson");
        expect(personSource).toContain("redefines Employee.specificColleagues.specificColleague");

        const services = createTontoServices({ ...NodeFileSystem }).Tonto;
        const importedManifest = readManifest(importedDir);
        const importedDocuments = await buildFolderDocuments(importedDir, services, {
            manifest: importedManifest,
            validation: true,
        });
        const validationErrors = importedDocuments.documents.all
            .flatMap((doc) => doc.diagnostics ?? [])
            .toArray()
            .filter((diagnostic) => diagnostic.severity === 1);

        expect(validationErrors).toHaveLength(0);
    });

    it("should sanitize JSON names with spaces and reserved keywords when rendering Tonto", () => {
        const project = new Project({ name: new MultilingualText("Sanitize Test") });
        const model = project.createModel({ name: new MultilingualText("Sanitize Test") });
        const peoplePackage = model.createPackage("People Hub");
        const nameType = peoplePackage.createDatatype("Person Name");
        const formerStudent = peoplePackage.createRole("Former Student");

        formerStudent.createAttribute(nameType, "class");

        const fileNode = new CompositeGeneratorNode();
        createTontoPackage(peoplePackage, fileNode);
        const rendered = toString(fileNode);

        expect(rendered).toContain("package People-Hub");
        expect(rendered).toContain("datatype Person-Name");
        expect(rendered).toContain("role Former-Student");
        expect(rendered).toContain("class_ : Person-Name");
    });

    it("should import packages with enumerations without trying to read enum attributes", async () => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tonto-enum-import-"));
        tempDirs.push(tempDir);

        const project = new Project({ name: new MultilingualText("Enum Import Test") });
        const model = project.createModel({ name: new MultilingualText("Enum Import Test") });
        const datatypesPackage = model.createPackage("Datatypes");

        datatypesPackage.createDatatype("PhoneNumber");
        const color = datatypesPackage.createEnumeration("Color");
        color.createLiteral("Red");
        color.createLiteral("Blue");

        const sourceFilePath = path.join(tempDir, "enum-import.json");
        fs.writeFileSync(sourceFilePath, serializeProject(project));

        const importResult = await importCommand({
            fileName: sourceFilePath,
            destination: path.join(tempDir, "imported"),
        });

        expect(importResult.success).toBe(true);

        const datatypesFilePath = path.join(importResult.filePath ?? "", "Datatypes", "Datatypes.tonto");
        const datatypesSource = fs.readFileSync(datatypesFilePath, "utf8");

        expect(datatypesSource).toContain("datatype PhoneNumber");
        expect(datatypesSource).toContain("enum Color");
        expect(datatypesSource).toContain("Red");
        expect(datatypesSource).toContain("Blue");
    });
});

function createTempProject(manifestOverrides: Partial<TontoManifest> = {}): { manifest: TontoManifest; tempDir: string } {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tonto-project-roundtrip-"));
    tempDirs.push(tempDir);

    const manifest: TontoManifest = {
        ...createDefaultTontoManifest(),
        projectName: "test-project",
        displayName: "Test Project",
        publisher: "test-publisher",
        authors: [],
        ...manifestOverrides,
    };

    fs.writeFileSync(path.join(tempDir, "tonto.json"), JSON.stringify(manifest, null, 2));

    return {
        manifest,
        tempDir,
    };
}

function writeProjectFile(filePath: string, contents: string): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, contents);
}

function readManifest(tempDir: string): TontoManifest {
    return JSON.parse(fs.readFileSync(path.join(tempDir, "tonto.json"), "utf8")) as TontoManifest;
}
