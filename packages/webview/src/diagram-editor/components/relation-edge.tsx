import * as React from "react";
import {
    EdgeLabelRenderer,
    EdgeProps,
    Position,
    getBezierPath,
    getSmoothStepPath,
} from "@xyflow/react";

type EdgeEnd = "source" | "target";
type MarkerKind = "diamond-open" | "diamond-solid";

const POSITION_ROTATION: Record<Position, number> = {
    [Position.Top]: 180,
    [Position.Bottom]: 0,
    [Position.Left]: 90,
    [Position.Right]: 270,
};

/**
 * Theme-aware fallback for the edge stroke. Used directly on the SVG path so
 * the line is visible even if the `var(--edge)` CSS variable somehow fails to
 * resolve at the webview's SVG element. The CSS rule
 * `.react-flow__edge-path { stroke: var(--edge) !important; ... }` will
 * upgrade the colour to the themed value when CSS is fully applied.
 */
const FALLBACK_STROKE = "#1F1A14";

export function RelationEdge(props: EdgeProps) {
    const routing = typeof props.data?.routing === "string" ? props.data.routing : "step";
    const [edgePath, labelX, labelY] = routing === "curved"
        ? getBezierPath(props)
        : getSmoothStepPath({ ...props, borderRadius: 0 });

    const sourceCardinality = typeof props.data?.sourceCardinality === "string" ? props.data.sourceCardinality : undefined;
    const targetCardinality = typeof props.data?.targetCardinality === "string" ? props.data.targetCardinality : undefined;
    const sourceEnd = typeof props.data?.sourceEnd === "string" ? props.data.sourceEnd : undefined;
    const targetEnd = typeof props.data?.targetEnd === "string" ? props.data.targetEnd : undefined;
    const stereotype = typeof props.data?.stereotype === "string" ? props.data.stereotype : undefined;
    const marker = resolveMarker(props.data?.connector);

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
            {/* Wider transparent hit area so users can click the edge to select it. */}
            <path
                className="react-flow__edge-interaction"
                d={edgePath}
                stroke="transparent"
                strokeWidth={20}
                fill="none"
            />
            {marker ? renderMarker(marker, props) : null}
            <EdgeLabelRenderer>
                {(props.label || stereotype) ? (
                    <div
                        className="tonto-edge-label absolute"
                        style={{
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                            pointerEvents: "all",
                        }}
                    >
                        {props.label ? <span>{String(props.label)}</span> : null}
                        {stereotype ? <span className="stereo">{`@${stereotype}`}</span> : null}
                    </div>
                ) : null}
                {renderEndLabel(sourceEnd, sourceCardinality, props.sourceX, props.sourceY, "source", props.sourcePosition)}
                {renderEndLabel(targetEnd, targetCardinality, props.targetX, props.targetY, "target", props.targetPosition)}
            </EdgeLabelRenderer>
        </>
    );
}

function resolveMarker(connector: unknown): { kind: MarkerKind; end: EdgeEnd } | undefined {
    if (connector === "aggregation") return { kind: "diamond-open", end: "target" };
    if (connector === "aggregation-inverted") return { kind: "diamond-open", end: "source" };
    if (connector === "composition") return { kind: "diamond-solid", end: "target" };
    if (connector === "composition-inverted") return { kind: "diamond-solid", end: "source" };
    return undefined;
}

function renderMarker(marker: { kind: MarkerKind; end: EdgeEnd }, props: EdgeProps): React.ReactNode {
    const x = marker.end === "target" ? props.targetX : props.sourceX;
    const y = marker.end === "target" ? props.targetY : props.sourceY;
    const rot = POSITION_ROTATION[marker.end === "target" ? props.targetPosition : props.sourcePosition];
    // Polygon points: tip at (0,0), body extending down to (0,18).
    const points = "0,0 -6,9 0,18 6,9";
    const fillClass = marker.kind === "diamond-solid" ? "fill-edge" : "fill-surface";
    return (
        <polygon
            className={`tonto-edge-marker ${fillClass}`}
            points={points}
            transform={`translate(${x} ${y}) rotate(${rot})`}
            fill={marker.kind === "diamond-solid" ? FALLBACK_STROKE : "#FBF8F2"}
            stroke={FALLBACK_STROKE}
            strokeWidth={1.25}
            strokeLinejoin="miter"
        />
    );
}

function renderEndLabel(
    name: string | undefined,
    cardinality: string | undefined,
    x: number,
    y: number,
    which: EdgeEnd,
    position: Position,
) {
    if (!name && !cardinality) return null;
    const { dx, dy, align } = endLabelOffset(position);
    return (
        <div
            key={which}
            className="tonto-edge-end absolute"
            style={{
                transform: `translate(${align}) translate(${x + dx}px, ${y + dy}px)`,
                pointerEvents: "none",
            }}
        >
            {name ? <span className="end-name">{name}</span> : null}
            {cardinality ? <span className="end-card">{cardinality}</span> : null}
        </div>
    );
}

function endLabelOffset(position: Position): { dx: number; dy: number; align: string } {
    switch (position) {
        case Position.Top:    return { dx: 8,  dy: -8,  align: "0, -100%" };
        case Position.Bottom: return { dx: 8,  dy: 8,   align: "0, 0" };
        case Position.Left:   return { dx: -10, dy: -4, align: "-100%, -100%" };
        case Position.Right:  return { dx: 10, dy: -4,  align: "0, -100%" };
        default:              return { dx: 8,  dy: -8,  align: "0, -100%" };
    }
}
