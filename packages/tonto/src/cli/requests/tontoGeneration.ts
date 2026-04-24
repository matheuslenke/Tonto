import path from "node:path";

export const TONTO_GENERATION_STEPS = {
    importing: "importing",
    sourceLoading: "source loading",
    sourceValidation: "source validation",
    projectParsing: "project parsing",
    packageGeneration: "package generation",
    fileWriting: "file writing",
} as const;

export type TontoGenerationStep = (typeof TONTO_GENERATION_STEPS)[keyof typeof TONTO_GENERATION_STEPS];

export type TontoGenerationErrorInfo = {
    code?: string;
    title: string;
    description: string;
    severity: "error";
    filePath?: string;
    line?: number;
    column?: number;
};

type CreateTontoGenerationErrorOptions = {
    error?: unknown;
    info?: TontoGenerationErrorInfo[];
    step: TontoGenerationStep;
};

const MAX_FORMATTED_ISSUES = 8;

export class TontoGenerationError extends Error {
    override readonly cause?: unknown;
    readonly info: TontoGenerationErrorInfo[];
    readonly step: TontoGenerationStep;

    constructor(message: string, step: TontoGenerationStep, info: TontoGenerationErrorInfo[], cause?: unknown) {
        super(message);
        this.name = "TontoGenerationError";
        this.step = step;
        this.info = info;
        this.cause = cause;
    }
}

export function isTontoGenerationError(value: unknown): value is TontoGenerationError {
    return value instanceof TontoGenerationError;
}

export function createTontoGenerationError(
    message: string,
    options: CreateTontoGenerationErrorOptions
): TontoGenerationError {
    const info = [...(options.info ?? [])];

    if (!isTontoGenerationError(options.error) && options.error !== undefined && info.length === 0) {
        info.push(getTontoGenerationCauseInfo(options.error));
    }

    if (info.length === 0) {
        info.push({
            severity: "error",
            title: "Unexpected generation error",
            description: message,
        });
    }

    return new TontoGenerationError(message, options.step, info, options.error);
}

export function normalizeTontoGenerationError(
    error: unknown,
    message: string,
    step: TontoGenerationStep,
    info?: TontoGenerationErrorInfo[]
): TontoGenerationError {
    if (isTontoGenerationError(error)) {
        return error;
    }

    return createTontoGenerationError(message, {
        error,
        info,
        step,
    });
}

export function formatTontoGenerationErrorMessage(error: unknown): string {
    if (!isTontoGenerationError(error)) {
        if (error instanceof Error) {
            return error.message;
        }

        return String(error);
    }

    const lines = [error.message, `Step: ${error.step}`];
    const visibleIssues = error.info.slice(0, MAX_FORMATTED_ISSUES);

    visibleIssues.forEach((info, index) => {
        lines.push(`${index + 1}. ${formatTontoGenerationInfo(info)}`);
    });

    if (error.info.length > visibleIssues.length) {
        lines.push(`Additional issues: ${error.info.length - visibleIssues.length} more.`);
    }

    return lines.join("\n");
}

function formatTontoGenerationInfo(info: TontoGenerationErrorInfo): string {
    const location = formatInfoLocation(info);
    return `${info.title}: ${info.description}${location}`;
}

function formatInfoLocation(info: TontoGenerationErrorInfo): string {
    if (!info.filePath) {
        return "";
    }

    const fileName = path.basename(info.filePath);
    const line = info.line ? `:${info.line}` : "";
    const column = info.column ? `:${info.column}` : "";

    return ` (${fileName}${line}${column})`;
}

function getTontoGenerationCauseInfo(error: unknown): TontoGenerationErrorInfo {
    if (error instanceof Error) {
        return {
            severity: "error",
            title: error.name,
            description: error.message,
        };
    }

    return {
        severity: "error",
        title: "Unexpected error",
        description: String(error),
    };
}
