import * as React from "react";
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from "@xyflow/react";

export function RelationEdge(props: EdgeProps) {
    const [edgePath, labelX, labelY] = getBezierPath(props);
    const sourceCardinality = typeof props.data?.sourceCardinality === "string" ? props.data.sourceCardinality : undefined;
    const targetCardinality = typeof props.data?.targetCardinality === "string" ? props.data.targetCardinality : undefined;
    const stereotype = typeof props.data?.stereotype === "string" ? props.data.stereotype : undefined;
    const markerEnd = resolveMarkerEnd(props.data?.connector);

    return (
        <>
            <defs>
                <marker id="tonto-diamond-open" viewBox="0 0 16 10" refX="14" refY="5" markerWidth="12" markerHeight="12" orient="auto">
                    <path d="M 0 5 L 5 0 L 10 5 L 5 10 Z" fill="#ffffff" stroke="#273449" strokeWidth="1.2" />
                </marker>
                <marker id="tonto-diamond-solid" viewBox="0 0 16 10" refX="14" refY="5" markerWidth="12" markerHeight="12" orient="auto">
                    <path d="M 0 5 L 5 0 L 10 5 L 5 10 Z" fill="#273449" stroke="#273449" strokeWidth="1.2" />
                </marker>
            </defs>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ stroke: "#273449", strokeWidth: 1.8 }} />
            <EdgeLabelRenderer>
                <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-300/80 bg-white/90 px-3 py-1 font-mono text-[11px] text-slate-700 shadow-sm"
                    style={{
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                    }}
                >
                    {props.label ? <span>{props.label}</span> : null}
                    {stereotype ? <span className="ml-2 text-slate-500">{`@${stereotype}`}</span> : null}
                </div>
                {sourceCardinality ? (
                    <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] text-slate-500"
                        style={{
                            transform: `translate(-50%, -50%) translate(${props.sourceX}px, ${props.sourceY - 18}px)`,
                        }}
                    >
                        {sourceCardinality}
                    </div>
                ) : null}
                {targetCardinality ? (
                    <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] text-slate-500"
                        style={{
                            transform: `translate(-50%, -50%) translate(${props.targetX}px, ${props.targetY - 18}px)`,
                        }}
                    >
                        {targetCardinality}
                    </div>
                ) : null}
            </EdgeLabelRenderer>
        </>
    );
}

function resolveMarkerEnd(connector: unknown): string | undefined {
    if (connector === "aggregation" || connector === "aggregation-inverted") {
        return "url(#tonto-diamond-open)";
    }

    if (connector === "composition" || connector === "composition-inverted") {
        return "url(#tonto-diamond-solid)";
    }

    return undefined;
}
