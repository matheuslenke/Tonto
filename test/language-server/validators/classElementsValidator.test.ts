import { EmptyFileSystem, Grammar } from "langium";
import { ParserRule } from "langium/lib/grammar/generated/ast";
import { createTontoServices } from "../../../src/language-server/tonto-module";
import { parseHelper, validationHelper } from "../../../src/test/tonto-test";

describe("ClassElement Validator tests", () => {
    const tontoStub = `
    module UFOS {
      kind Person
      kind Person
    }
  `;
    const services = createTontoServices(EmptyFileSystem);
    const parse = parseHelper<Grammar>(services.Tonto);
    const validate = validationHelper(services.Tonto);

    let rules: ParserRule[] = [];

    // it("should have duplicated class names error", async () => {
    //     const validationResult = await validate(tontoStub);

    //     const diagnostics = validationResult.diagnostics;

    //     expect(diagnostics).not.toBeNull();

    //     if (diagnostics != undefined) {
    //         const error = diagnostics[0];
    //         expect(error.message).toBe("Duplicated class declaration");
    //     }
    // });

    //     const tontoCompatibleNaturesStub = `
    //     module OntologicalNaturesError {
    //         category Furniture of objects
    //         category SpecificFurniture of collectives specializes Furniture
    //         category EventFurniture of collectives, objects
    //         category ErrorFurniture of collectives, objects specializes EventFurniture
    //         category ErrorFurniture2 of collectives, objects specializes EventFurniture
    //     }
    //   `;

    //     it("should have Incompatible Natures error", async () => {
    //         const validationResult = await validate(tontoCompatibleNaturesStub);

    //         const diagnostics = validationResult.diagnostics;

    //         expect(diagnostics).not.toBeNull();

    //         if (diagnostics != undefined) {
    //             const error = diagnostics[0];
    //             expect(error.message).toBe(
    //                 "This element cannot be restricted to Natures that its superclass is not restricted"
    //             );
    //         }
    //     });

    describe("Every Sortal class should specialize a unique ultimate sortal", async () => {
        const tontoSortalSpecializesUniqueUltimateSortalStub = `
        module SortalValidator {
            kind Rock
            kind Wood
            subkind WoodRock specializes Rock, Wood

            kind Person
            kind Organization
            subkind Agent specializes Organization, Person

            kind BiologicalAnimal
            phase Teenager specializes Person, BiologicalAnimal

            event TestEvent specializes Person, Organization
        }
        `;

        it("should have UltimateSortal unique specialization error", async () => {
            const validationResult = await validate(
                tontoSortalSpecializesUniqueUltimateSortalStub
            );

            const diagnostics = validationResult.diagnostics;

            expect(diagnostics).not.toBeNull();
            expect(diagnostics.length).toBe(4);

            if (diagnostics != undefined) {
                diagnostics.forEach(error => {
                    expect(error.message).toBe(
                        "Every sortal class must specialize a unique ultimate sortal (Kind, Collective, Quantity, Relator, Quality or Mode)"
                    );
                });
            }
        });

        const zeroSpecializationsStub = `
        module CheckKindSpecialization {
            kind Person
            subkind Agent
            phase Child
        }
        `

        it("should have sortal not specializing any UltimateSortal error", async () => {
            const validationResult = await validate(zeroSpecializationsStub);

            const diagnostics = validationResult.diagnostics;

            expect(diagnostics).not.toBeNull();
            expect(diagnostics.length).toBe(2);

            if (diagnostics != undefined) {
                const firstError = diagnostics[0];
                expect(firstError.message).toBe(
                    "Every sortal class must specialize a unique ultimate sortal. The class Agent must specialize (directly or indirectly) a unique class decorated as one of the following: kind, collective, quantity, relator, quality, mode, intrinsicMode, extrinsicMode"
                );
                const secondError = diagnostics[1];
                expect(secondError.message).toBe(
                    "Every sortal class must specialize a unique ultimate sortal. The class Child must specialize (directly or indirectly) a unique class decorated as one of the following: kind, collective, quantity, relator, quality, mode, intrinsicMode, extrinsicMode"
                );
            }
        });

        const oneSpecializationsStub = `
        module CheckKindSpecialization {
            kind Person
            subkind Agent specializes Person
        }
        `

        it("should not have sortal not specializing any UltimateSortal error", async () => {
            const validationResult = await validate(oneSpecializationsStub);

            const diagnostics = validationResult.diagnostics;

            expect(diagnostics).not.toBeNull();
            expect(diagnostics.length).toBe(0);
        });
    });

    describe("Classes representing Ultimate Sortals cannot specialize other Ultimate Sortals", async () => {
        const ultimateSortalStub = `
            module UltimateSortalValidator {
                kind Pai
                kind Filho specializes Pai
                collective CollectivePai
                collective CollectiveFilho specializes CollectivePai
                quantity QuantityPai
                quantity QuantityFilho specializes QuantityPai
                relator relatorPai
                relator relatorFilho specializes relatorPai
                quality qualityPai
                quality qualityFilho specializes qualityPai
                mode modePai
                mode modeFilho specializes modePai
                extrinsicMode extrinsicModePai
                extrinsicMode extrinsicModeFilho specializes extrinsicModePai
                intrinsicMode intrinsicModePai
                intrinsicMode intrinsicModeFilho specializes intrinsicModePai
            }
        `;

        it("should have Kind specialization Error", async () => {
            const validationResult = await validate(ultimateSortalStub);

            const diagnostics = validationResult.diagnostics;

            expect(diagnostics).not.toBeNull();
            expect(diagnostics.length).toBe(8);

            if (diagnostics != undefined) {
                diagnostics.forEach(error => {
                    expect(error.message).toBe(
                        "Classes representing ultimate sortals cannot specialize other ultimate sortals"
                    );
                });
            }
        });
    });

    describe("Class Declaration should have a defined stereotype", () => {
        const firstStub = `
            module classError {
                class ClassWithoutStereotype
            }
        `

        it("Should have a warning about class without defined stereotype", async () => {
            const validationResult = await validate(firstStub);

            const diagnostics = validationResult.diagnostics;

            expect(diagnostics).not.toBeNull();

            if (diagnostics != undefined) {
                const error = diagnostics[0];
                expect(error.message).toBe(
                    "Consider using an annotation or a more specific class"
                );
            }
        })
    })
});
