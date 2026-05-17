import * as React from "react";
import {
    EdgeLabelRenderer,
    EdgeProps,
    Position,
    getBezierPath,
    getSmoothStepPath,
} from "@xyflow/react";

const POSITION_ROTATION: Record<Position, number> = {
    [Position.Top]: 180,
    [Position.Bottom]: 0,
    [Position.Left]: 90,
    [Position.Right]: 270,
};

const FALLBACK_STROKE = "#1F1A14";

export function SpecializationEdge(props: EdgeProps) {
    const routing = typeof props.data?.routing === "string" ? props.data.routing : "step";
    const [edgePath, labelX, labelY] = routing === "curved"
        ? getBezierPath(props)
        : getSmoothStepPath({ ...props, borderRadius: 0 });

    return (
        <>
            <path
                id={props.id}
                className="react-flow__edge-path"
                d={edgePath}
                stroke={FALLBACK_STROKE}
                strokeWidth={1.35}
                fill="none"
            />
            <path
                className="react-flow__edge-interaction"
                d={edgePath}
                stroke="transparent"
                strokeWidth={20}
                fill="none"
            />
            {/* UML generalization arrow — open triangle with the tip at the target. */}
            <polygon
                className="tonto-edge-marker fill-surface"
                points="-7,12 0,0 7,12"
                transform={`translate(${props.targetX} ${props.targetY}) rotate(${POSITION_ROTATION[props.targetPosition]})`}
                fill="#FBF8F2"
                stroke={FALLBACK_STROKE}
                strokeWidth={1.25}
                strokeLinejoin="miter"
            />
            <EdgeLabelRenderer>
                <div
                    className="tonto-edge-spec-label absolute"
                    style={{
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 16}px)`,
                        pointerEvents: "none",
                    }}
                >
                    specializes
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
