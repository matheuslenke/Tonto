import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { importCommand, newImportCommand } from "../../../src/cli/actions/commands/importCommand.js";
import {
    createTontoGenerationError,
    formatTontoGenerationErrorMessage,
    isTontoGenerationError,
    TONTO_GENERATION_STEPS,
} from "../../../src/cli/requests/tontoGeneration.js";

describe("Tonto generation errors", () => {
    it("should format structured generation errors with step and file location", () => {
        const error = createTontoGenerationError(
            'Could not generate Tonto files from "example.json".',
            {
                step: TONTO_GENERATION_STEPS.packageGeneration,
                info: [
                    {
                        severity: "error",
                        title: "Package generation error",
                        description: "Name collision while rendering the package.",
                        filePath: "/tmp/model/People.tonto",
                        line: 4,
                        column: 2,
                    },
                ],
            }
        );

        const formattedMessage = formatTontoGenerationErrorMessage(error);

        expect(formattedMessage).toContain('Could not generate Tonto files from "example.json".');
        expect(formattedMessage).toContain("Step: package generation");
        expect(formattedMessage).toContain(
            "Package generation error: Name collision while rendering the package. (People.tonto:4:2)"
        );
    });

    it("should return formatted source loading errors from importCommand", async () => {
        const missingFilePath = path.join(os.tmpdir(), `tonto-missing-${Date.now()}.json`);

        const result = await importCommand({ fileName: missingFilePath });

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.message).toContain(`Could not read the source JSON file "${path.basename(missingFilePath)}".`);
        expect(result.message).toContain("Step: source loading");
        expect(result.message).toContain(path.basename(missingFilePath));
    });

    it("should throw typed source loading errors from newImportCommand", async () => {
        const missingFilePath = path.join(os.tmpdir(), `tonto-missing-${Date.now()}.json`);

        let thrownError: unknown;
        try {
            await newImportCommand({ fileName: missingFilePath });
        } catch (error) {
            thrownError = error;
        }

        expect(isTontoGenerationError(thrownError)).toBe(true);
        if (!isTontoGenerationError(thrownError)) {
            throw new Error("Expected a TontoGenerationError");
        }

        expect(thrownError.step).toBe(TONTO_GENERATION_STEPS.sourceLoading);
        expect(formatTontoGenerationErrorMessage(thrownError)).toContain("Step: source loading");
    });
});
