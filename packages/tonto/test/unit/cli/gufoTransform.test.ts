import { MultilingualText, Project } from "ontouml-js";
import { describe, expect, it } from "vitest";
import { attributeGenerator } from "../../../src/cli/generators/attribute.generator.js";
import { customDataTypeAttributesGenerator } from "../../../src/cli/generators/datatype.generator.js";
import { isGufoResultResponse } from "../../../src/cli/actions/commands/generateGufoCommand.js";
import {
    TransformTontoToGufo,
    createGufoErrorResponse,
    formatGufoErrorMessage,
} from "../../../src/cli/requests/gufoTransform.js";

describe("GUFO transform responses", () => {
    it("should identify successful GUFO responses", () => {
        expect(isGufoResultResponse({ result: "@prefix gufo: <...>" })).toBe(true);
        expect(isGufoResultResponse({ message: "failed", info: [] })).toBe(false);
        expect(isGufoResultResponse({ message: "failed" })).toBe(false);
    });

    it("should create normalized GUFO error responses from thrown errors", () => {
        const response = createGufoErrorResponse("Transformation failed", {
            error: new TypeError("Cannot read properties of undefined"),
        });

        expect(response.message).toBe("Transformation failed");
        expect(response.status).toBe(500);
        expect(response.info).toHaveLength(1);
        expect(response.info[0]).toMatchObject({
            severity: "error",
            title: "TypeError",
            description: "Cannot read properties of undefined",
        });
    });

    it("should format GUFO errors without requiring info details", () => {
        expect(formatGufoErrorMessage({ message: "Transformation failed" })).toBe("Transformation failed");
        expect(
            formatGufoErrorMessage({
                message: "Transformation failed",
                info: [{ description: "Invalid generalization set" }],
            })
        ).toBe("Transformation failed\nInvalid generalization set");
    });

    it("should reject nameless datatypes before invoking the gUFO transformer", async () => {
        const project = new Project({ name: new MultilingualText("Test Project") });
        const model = project.createModel({ name: new MultilingualText("Test Model") });
        const datatype = model.createDatatype("Identifier");
        datatype.id = "Identifier";
        datatype.name.clear();

        const response = await TransformTontoToGufo(project);

        expect(isGufoResultResponse(response)).toBe(false);
        if (isGufoResultResponse(response)) {
            throw new Error("Expected an error response");
        }

        expect(response.status).toBe(400);
        expect(response.info[0]?.title).toBe("Missing datatype name");
        expect(response.info[0]?.description).toContain("Identifier");
    });

    it("should resolve class attributes by datatype identifier even when the datatype label differs", () => {
        const project = new Project({ name: new MultilingualText("Test Project") });
        const model = project.createModel({ name: new MultilingualText("Test Model") });
        const order = model.createKind("Order");
        order.id = "Order";

        const customerId = model.createDatatype("Customer Identifier");
        customerId.id = "CustomerId";

        attributeGenerator(
            {
                attributes: [
                    {
                        name: "customerId",
                        attributeTypeRef: { ref: { name: "CustomerId" } },
                        cardinality: undefined,
                        isOrdered: false,
                        isDerived: false,
                        isConst: false,
                    },
                ],
            } as any,
            order,
            [customerId]
        );

        expect(order.properties).toHaveLength(1);
        expect(order.properties[0].propertyType).toBe(customerId);
    });

    it("should resolve datatype attributes by source and target datatype identifiers", () => {
        const project = new Project({ name: new MultilingualText("Test Project") });
        const model = project.createModel({ name: new MultilingualText("Test Model") });
        const phoneNumber = model.createDatatype("Phone Number");
        phoneNumber.id = "PhoneNumber";

        const countryCode = model.createDatatype("Country Code");
        countryCode.id = "CountryCode";

        customDataTypeAttributesGenerator(
            {
                name: "PhoneNumber",
                attributes: [
                    {
                        name: "countryCode",
                        attributeTypeRef: { ref: { name: "CountryCode" } },
                        cardinality: undefined,
                        isOrdered: false,
                        isDerived: false,
                        isConst: false,
                    },
                ],
            } as any,
            [phoneNumber, countryCode]
        );

        expect(phoneNumber.properties).toHaveLength(1);
        expect(phoneNumber.properties[0].propertyType).toBe(countryCode);
    });
});
