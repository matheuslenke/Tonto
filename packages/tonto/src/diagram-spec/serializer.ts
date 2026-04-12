import { TontoDiagramSpec } from "./types.js";

export function serializeTontoDiagramSpec(spec: TontoDiagramSpec): string {
    const lines: string[] = [];

    lines.push(`diagram "${spec.title}" {`);
    lines.push(`  source "${spec.source}"`);

    if (spec.module) {
        lines.push(`  module ${spec.module}`);
    }

    lines.push("");
    lines.push("  filter {");
    if (spec.filter.include.length > 0) {
        lines.push(`    include ${spec.filter.include.join(", ")}`);
    }
    lines.push(`    external ${spec.filter.external ? "true" : "false"}`);
    lines.push(`    datatypes ${spec.filter.datatypes ? "true" : "false"}`);
    lines.push("  }");

    lines.push("");
    lines.push("  presentation {");
    lines.push(`    theme ${spec.presentation.theme}`);
    lines.push(`    direction ${spec.presentation.direction}`);
    lines.push(`    stereotypes ${spec.presentation.stereotypes ? "true" : "false"}`);
    lines.push(`    attributes ${spec.presentation.attributes ? "true" : "false"}`);
    lines.push("  }");

    if (spec.nodes.length > 0) {
        lines.push("");
        for (const layout of [...spec.nodes].sort((left, right) => left.target.localeCompare(right.target))) {
            lines.push(`  node ${layout.target} { x ${formatNumber(layout.x)} y ${formatNumber(layout.y)} }`);
        }
    }

    lines.push("");
    lines.push(`  viewport { x ${formatNumber(spec.viewport.x)} y ${formatNumber(spec.viewport.y)} zoom ${formatNumber(spec.viewport.zoom)} }`);
    lines.push("}");

    return lines.join("\n");
}

export function updateTontoDiagramLayout(
    spec: TontoDiagramSpec,
    layouts: Array<{ target: string; x: number; y: number }>,
    viewport: TontoDiagramSpec["viewport"]
): TontoDiagramSpec {
    const normalizedLayouts = [...layouts]
        .sort((left, right) => left.target.localeCompare(right.target))
        .map((layout) => ({
            target: layout.target,
            x: roundNumber(layout.x),
            y: roundNumber(layout.y),
        }));

    return {
        ...spec,
        nodes: normalizedLayouts,
        viewport: {
            x: roundNumber(viewport.x),
            y: roundNumber(viewport.y),
            zoom: roundNumber(viewport.zoom),
        },
    };
}

function formatNumber(value: number): string {
    if (Number.isInteger(value)) {
        return `${value}`;
    }
    return `${roundNumber(value)}`;
}

function roundNumber(value: number): number {
    return Math.round(value * 100) / 100;
}
