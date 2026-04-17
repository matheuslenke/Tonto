import * as React from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import type { TontoDiagramNode } from "tonto-cli";
import { cn } from "../lib/cn";

type DiagramNodeData = {
    node: TontoDiagramNode;
    showAttributes: boolean;
    showStereotypes: boolean;
};

const PALETTE_BY_TOKEN = {
    "functional-complexes": { accent: "#CD6872", surface: "#FFDADD", edge: "#B74B58" },
    collectives: { accent: "#CD6872", surface: "#FFDADD", edge: "#B74B58" },
    quantities: { accent: "#CD6872", surface: "#FFDADD", edge: "#B74B58" },
    relators: { accent: "#6CC86A", surface: "#D8FFD9", edge: "#4FA04D" },
    qualities: { accent: "#58AEE6", surface: "#CFEFFF", edge: "#347EAA" },
    modes: { accent: "#58AEE6", surface: "#CFEFFF", edge: "#347EAA" },
    events: { accent: "#D0B742", surface: "#FCF4C8", edge: "#A58D1C" },
    situations: { accent: "#E7A54C", surface: "#FBE6C8", edge: "#B06D10" },
    types: { accent: "#9C83D8", surface: "#E6DEFB", edge: "#6A54A7" },
    "abstract-individuals": { accent: "#C0C0C0", surface: "#F1F1F1", edge: "#808080" },
    none: { accent: "#A6A6A6", surface: "#ECECEC", edge: "#747474" },
} as const;

export function DiagramNode(props: NodeProps) {
    const diagramNode = readDiagramNode(props.data);
    if (!diagramNode) {
        return null;
    }
    const { node, showAttributes, showStereotypes } = diagramNode;
    const palette = PALETTE_BY_TOKEN[node.appearance.palette];

    return (
        <div
            className={cn(
                "relative min-w-[16rem] overflow-hidden rounded-2xl border bg-white/90 shadow-diagram backdrop-blur-sm",
                node.appearance.rigidity === "anti-rigid" && "border-dashed",
                node.appearance.rigidity !== "anti-rigid" && "border-solid",
                node.appearance.external && "opacity-80",
            )}
            style={{
                borderColor: palette.edge,
                backgroundColor: palette.surface,
            }}
        >
            <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-0 !bg-slate-900/70" />
            <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-0 !bg-slate-900/70" />

            <div
                className={cn(
                    "flex items-start justify-between gap-3 px-4 py-3 text-slate-900",
                    node.appearance.accent === "non-sortal" && "border-b-4",
                    node.appearance.accent !== "non-sortal" && "border-b-2",
                )}
                style={{
                    borderColor: palette.accent,
                    background: `linear-gradient(135deg, ${palette.accent}22 0%, transparent 80%)`,
                }}
            >
                <div>
                    {showStereotypes && node.stereotype ? (
                        <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-700">
                            {`<<${node.stereotype}>>`}
                        </div>
                    ) : null}
                    <div className="font-display text-xl leading-tight">{node.label}</div>
                    <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.24em] text-slate-600">
                        {node.module}
                    </div>
                </div>
                {node.appearance.external ? (
                    <span className="rounded-full border border-slate-700/20 bg-white/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-700">
                        External
                    </span>
                ) : null}
            </div>

            <div className="space-y-2 px-4 py-3 font-mono text-[12px] text-slate-800">
                {showAttributes && node.attributes.length > 0 ? (
                    node.attributes.map((attribute) => (
                        <div key={`${attribute.name}:${attribute.type}`} className="flex items-baseline justify-between gap-4">
                            <span className="truncate">{attribute.name}</span>
                            <span className="truncate text-slate-500">
                                {attribute.type}
                                {attribute.cardinality ? ` ${attribute.cardinality}` : ""}
                            </span>
                        </div>
                    ))
                ) : <div className="text-slate-500">
                    {showAttributes ? (node.isEnum ? "No enum values" : "No attributes") : "Attributes hidden"}
                </div>}
            </div>
        </div>
    );
}

function readDiagramNode(data: unknown): DiagramNodeData | undefined {
    if (!data || typeof data !== "object" || !("node" in data) || !("showAttributes" in data) || !("showStereotypes" in data)) {
        return undefined;
    }

    const payload = data as DiagramNodeData;
    return payload;
}
