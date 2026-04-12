import {
    TontoDiagramDirection,
    TontoDiagramIssue,
    TontoDiagramLayout,
    TontoDiagramParseResult,
    TontoDiagramPresentation,
    TontoDiagramSpec,
    TontoDiagramViewport
} from "./types.js";

const DEFAULT_PRESENTATION: TontoDiagramPresentation = {
    theme: "tonto-uml",
    direction: "LR",
    stereotypes: true,
    attributes: true,
};

const DEFAULT_VIEWPORT: TontoDiagramViewport = {
    x: 0,
    y: 0,
    zoom: 1,
};

const DEFAULT_SPEC: Omit<TontoDiagramSpec, "title" | "source"> = {
    module: undefined,
    filter: {
        include: [],
        external: false,
        datatypes: true,
    },
    presentation: DEFAULT_PRESENTATION,
    nodes: [],
    viewport: DEFAULT_VIEWPORT,
};

type BlockMatch = {
    body: string;
    endIndex: number;
    index: number;
};

type LineMatch = {
    value: string;
    index: number;
};

export function parseTontoDiagramSpec(sourceText: string): TontoDiagramParseResult {
    const issues: TontoDiagramIssue[] = [];
    const text = stripBlockComments(sourceText);
    const diagramMatch = text.match(/^([\s\S]*?)diagram\s+("([^"]+)"|'([^']+)')\s*\{([\s\S]*)\}\s*$/);

    if (!diagramMatch) {
        return {
            issues: [
                {
                    severity: "error",
                    message: 'Expected `diagram "Name" { ... }` root declaration.',
                    line: 1,
                },
            ],
        };
    }

    const title = diagramMatch[3] ?? diagramMatch[4] ?? "";
    const body = diagramMatch[5] ?? "";
    const sourceMatch = findLineValue(body, /(^|\n)\s*source\s+("([^"]+)"|'([^']+)')/);

    if (!sourceMatch) {
        issues.push({
            severity: "error",
            message: "Diagram source is required.",
            line: lineNumberForIndex(sourceText, 1),
        });
    }

    const moduleMatch = findLineValue(body, /(^|\n)\s*module\s+([A-Za-z_][\w.-]*)/);
    const filterBlock = findNamedBlock(body, "filter");
    const presentationBlock = findNamedBlock(body, "presentation");
    const viewportBlock = findNamedBlock(body, "viewport");
    const nodeMatches = [...body.matchAll(/\bnode\s+([A-Za-z_][\w.-]*)\s*\{\s*x\s+(-?\d+(?:\.\d+)?)\s+y\s+(-?\d+(?:\.\d+)?)\s*\}/g)];

    const parsedSpec: TontoDiagramSpec = {
        title,
        source: sourceMatch?.value ?? "",
        module: moduleMatch?.value,
        filter: parseFilterBlock(filterBlock, sourceText, issues),
        presentation: parsePresentationBlock(presentationBlock, sourceText, issues),
        nodes: parseNodeLayouts(nodeMatches, sourceText, issues),
        viewport: parseViewportBlock(viewportBlock, sourceText, issues),
    };

    if (!sourceMatch) {
        return { issues };
    }

    const strayContent = getStrayContent(body, [
        sourceMatch.index,
        sourceMatch.index + sourceMatch.value.length,
        moduleMatch ? moduleMatch.index : undefined,
        moduleMatch ? moduleMatch.index + moduleMatch.value.length : undefined,
        filterBlock?.index,
        filterBlock?.endIndex,
        presentationBlock?.index,
        presentationBlock?.endIndex,
        viewportBlock?.index,
        viewportBlock?.endIndex,
        ...nodeMatches.flatMap((match) => [match.index, match.index !== undefined ? match.index + match[0].length : undefined]),
    ]);

    if (strayContent.trim().length > 0) {
        issues.push({
            severity: "warning",
            message: "Some diagram content could not be interpreted and will be ignored.",
            line: lineNumberForIndex(sourceText, diagramMatch.index ?? 0),
        });
    }

    return {
        spec: {
            ...DEFAULT_SPEC,
            ...parsedSpec,
        },
        issues,
    };
}

function parseFilterBlock(
    block: BlockMatch | undefined,
    sourceText: string,
    issues: TontoDiagramIssue[]
): TontoDiagramSpec["filter"] {
    if (!block) {
        return DEFAULT_SPEC.filter;
    }

    const include = findLineValue(block.body, /(^|\n)\s*include\s+([^\n]+)/)?.value
        ?.split(",")
        .map((item) => item.trim())
        .filter(Boolean) ?? [];
    const external = parseBooleanSetting(block.body, "external", sourceText, block.index, issues, DEFAULT_SPEC.filter.external);
    const datatypes = parseBooleanSetting(block.body, "datatypes", sourceText, block.index, issues, DEFAULT_SPEC.filter.datatypes);

    return {
        include,
        external,
        datatypes,
    };
}

function parsePresentationBlock(
    block: BlockMatch | undefined,
    sourceText: string,
    issues: TontoDiagramIssue[]
): TontoDiagramPresentation {
    if (!block) {
        return DEFAULT_SPEC.presentation;
    }

    const theme = findLineValue(block.body, /(^|\n)\s*theme\s+([A-Za-z_][\w-]*)/)?.value ?? DEFAULT_PRESENTATION.theme;
    const directionValue = findLineValue(block.body, /(^|\n)\s*direction\s+([A-Z]{2})/)?.value ?? DEFAULT_PRESENTATION.direction;

    if (theme !== "tonto-uml") {
        issues.push({
            severity: "error",
            message: `Unsupported diagram theme \`${theme}\`.`,
            line: lineNumberForIndex(sourceText, block.index),
        });
    }

    if (!isDirection(directionValue)) {
        issues.push({
            severity: "error",
            message: `Unsupported diagram direction \`${directionValue}\`.`,
            line: lineNumberForIndex(sourceText, block.index),
        });
    }

    return {
        theme: "tonto-uml",
        direction: isDirection(directionValue) ? directionValue : DEFAULT_PRESENTATION.direction,
        stereotypes: parseBooleanSetting(block.body, "stereotypes", sourceText, block.index, issues, DEFAULT_PRESENTATION.stereotypes),
        attributes: parseBooleanSetting(block.body, "attributes", sourceText, block.index, issues, DEFAULT_PRESENTATION.attributes),
    };
}

function parseNodeLayouts(
    matches: RegExpMatchArray[],
    sourceText: string,
    issues: TontoDiagramIssue[]
): TontoDiagramLayout[] {
    const layouts = new Map<string, TontoDiagramLayout>();

    for (const match of matches) {
        const target = match[1];
        const x = Number(match[2]);
        const y = Number(match[3]);

        if (Number.isNaN(x) || Number.isNaN(y)) {
            issues.push({
                severity: "error",
                message: `Invalid coordinates for node \`${target}\`.`,
                line: lineNumberForIndex(sourceText, match.index ?? 0),
            });
            continue;
        }

        if (layouts.has(target)) {
            issues.push({
                severity: "warning",
                message: `Node layout for \`${target}\` is duplicated; last value wins.`,
                line: lineNumberForIndex(sourceText, match.index ?? 0),
            });
        }

        layouts.set(target, {
            target,
            x,
            y,
        });
    }

    return [...layouts.values()].sort((left, right) => left.target.localeCompare(right.target));
}

function parseViewportBlock(
    block: BlockMatch | undefined,
    sourceText: string,
    issues: TontoDiagramIssue[]
): TontoDiagramViewport {
    if (!block) {
        return DEFAULT_VIEWPORT;
    }

    const match = block.body.match(/\bx\s+(-?\d+(?:\.\d+)?)\s+y\s+(-?\d+(?:\.\d+)?)\s+zoom\s+(-?\d+(?:\.\d+)?)/);

    if (!match) {
        issues.push({
            severity: "error",
            message: "Viewport must define `x`, `y`, and `zoom` values.",
            line: lineNumberForIndex(sourceText, block.index),
        });
        return DEFAULT_VIEWPORT;
    }

    const x = Number(match[1]);
    const y = Number(match[2]);
    const zoom = Number(match[3]);

    if ([x, y, zoom].some((value) => Number.isNaN(value))) {
        issues.push({
            severity: "error",
            message: "Viewport values must be numeric.",
            line: lineNumberForIndex(sourceText, block.index),
        });
        return DEFAULT_VIEWPORT;
    }

    return { x, y, zoom };
}

function parseBooleanSetting(
    block: string,
    setting: string,
    sourceText: string,
    blockIndex: number,
    issues: TontoDiagramIssue[],
    fallback: boolean
): boolean {
    const match = findLineValue(block, new RegExp(`(^|\\n)\\s*${setting}\\s+(true|false)`));

    if (!match) {
        return fallback;
    }

    const value = match.value.trim();
    if (value !== "true" && value !== "false") {
        issues.push({
            severity: "error",
            message: `Expected boolean value for \`${setting}\`.`,
            line: lineNumberForIndex(sourceText, blockIndex + match.index),
        });
        return fallback;
    }

    return value === "true";
}

function findNamedBlock(input: string, name: string): BlockMatch | undefined {
    const blockStart = new RegExp(`\\b${name}\\s*\\{`, "g");
    const match = blockStart.exec(input);
    if (!match || match.index === undefined) {
        return undefined;
    }

    const braceIndex = input.indexOf("{", match.index);
    const endIndex = findMatchingBrace(input, braceIndex);
    if (endIndex < 0) {
        return undefined;
    }

    return {
        body: input.slice(braceIndex + 1, endIndex),
        endIndex: endIndex + 1,
        index: match.index,
    };
}

function findMatchingBrace(input: string, startIndex: number): number {
    let depth = 0;
    for (let index = startIndex; index < input.length; index += 1) {
        const char = input[index];
        if (char === "{") {
            depth += 1;
        } else if (char === "}") {
            depth -= 1;
            if (depth === 0) {
                return index;
            }
        }
    }
    return -1;
}

function findLineValue(input: string, expression: RegExp): LineMatch | undefined {
    const match = expression.exec(input);
    if (!match || match.index === undefined) {
        return undefined;
    }

    let candidate: string | undefined;
    for (let index = match.length - 1; index >= 1; index -= 1) {
        if (match[index] !== undefined) {
            candidate = match[index];
            break;
        }
    }
    if (!candidate) {
        return undefined;
    }
    return {
        value: candidate,
        index: match.index,
    };
}

function getStrayContent(input: string, ranges: Array<number | undefined>): string {
    const normalizedRanges: Array<{ start: number; end: number }> = [];

    for (let index = 0; index < ranges.length; index += 2) {
        const start = ranges[index];
        const end = ranges[index + 1];
        if (start === undefined || end === undefined) {
            continue;
        }
        normalizedRanges.push({ start, end });
    }

    normalizedRanges.sort((left, right) => left.start - right.start);

    let cursor = 0;
    let result = "";
    for (const range of normalizedRanges) {
        if (range.start > cursor) {
            result += input.slice(cursor, range.start);
        }
        cursor = Math.max(cursor, range.end);
    }
    if (cursor < input.length) {
        result += input.slice(cursor);
    }
    return result.replace(/\/\/.*$/gm, "").trim();
}

function isDirection(value: string): value is TontoDiagramDirection {
    return value === "LR" || value === "RL" || value === "TB" || value === "BT";
}

function stripBlockComments(input: string): string {
    return input.replace(/\/\*[\s\S]*?\*\//g, "");
}

function lineNumberForIndex(input: string, index: number): number {
    return input.slice(0, index).split(/\r?\n/).length;
}
