import { EmptyFileSystem, Grammar } from "langium";
import { createTontoServices } from "../../../src/language-server/tonto-module";
import { parseHelper, validationHelper } from "../../../src/test/tonto-test";

describe("Generalization Validator tests", () => {
    const services = createTontoServices(EmptyFileSystem);
    const parse = parseHelper<Grammar>(services.Tonto);
    const validate = validationHelper(services.Tonto);

    describe("Check for generalizationSet consistency", () => {
        const generalizationConsistencyStub = `
        module CheckGeneralizationConsistency {
            kind Person
            phase Adult specializes Person

            relation Person [1] -- hasAdultFriends -- [0..*] Adult

            genset GeneralizationOne {
                general Person
                specifics hasAdultFriends
            }
        }
    `;

        it("should have Prohibited generalization Error involving classes and relations", async () => {
            // const validationResult = await validate(generalizationConsistencyStub);

            // const diagnostics = validationResult.diagnostics;

            // expect(diagnostics).not.toBeNull();
            // expect(diagnostics.length).toBe(2);

            // if (diagnostics != undefined) {
            //     diagnostics.forEach(error => {
            //         expect(error.message).toBe(
            //             "Prohibited generalization: Generalizations must exclusively involve classes or relations, never a combination."
            //         );
            //     });
            // }
        });
    })
})
