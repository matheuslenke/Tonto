import chalk from "chalk";
import { formatJsonGenerationErrorMessage } from "../requests/jsonGeneration.js";

export function warnJsonGenerationIssue(error: unknown): void {
    console.warn(chalk.yellow(`JSON generation warning:\n${formatJsonGenerationErrorMessage(error)}`));
}
