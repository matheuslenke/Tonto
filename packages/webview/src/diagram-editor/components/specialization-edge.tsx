import * as React from "react";
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath } from "@xyflow/react";

export function SpecializationEdge(props: EdgeProps) {
    const [edgePath, labelX, labelY] = getSmoothStepPath(props);

    return (
        <>
            <defs>
                <marker id="tonto-generalization" viewBox="0 0 14 14" refX="12" refY="7" markerWidth="14" markerHeight="14" orient="auto">
                    <path d="M 1 7 L 12 1 L 12 13 Z" fill="#ffffff" stroke="#273449" strokeWidth="1.2" />
                </marker>
            </defs>
            <BaseEdge path={edgePath} markerEnd="url(#tonto-generalization)" style={{ stroke: "#273449", strokeWidth: 1.9 }} />
            <EdgeLabelRenderer>
                <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-300/60 bg-white/85 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500"
                    style={{
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 16}px)`,
                    }}
                >
                    specializes
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
