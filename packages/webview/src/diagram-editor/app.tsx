import * as React from "react";
import {
    Background,
    BackgroundVariant,
    Controls,
    ReactFlow,
    ReactFlowProvider,
    type Edge,
    type Node,
    type Viewport,
    useEdgesState,
    useNodesState,
} from "@xyflow/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { TontoDiagramGraph, TontoDiagramIssue } from "tonto-cli";
import { DiagramNode } from "./components/diagram-node";
import { RelationEdge } from "./components/relation-edge";
import { SpecializationEdge } from "./components/specialization-edge";
import type { DiagramDocumentStateMessage } from "./messages";
import { postToVscode } from "./vscode";

const EDGE_TYPES = {
    relation: RelationEdge,
    specialization: SpecializationEdge,
};

const NODE_TYPES = {
    diagram: DiagramNode,
};

export function App() {
    return (
        <ReactFlowProvider>
            <DiagramEditor />
        </ReactFlowProvider>
    );
}

function DiagramEditor() {
    const [documentText, setDocumentText] = React.useState("");
    const [sourceDraft, setSourceDraft] = React.useState("");
    const [graph, setGraph] = React.useState<TontoDiagramGraph | undefined>();
    const [issues, setIssues] = React.useState<TontoDiagramIssue[]>([]);
    const [hasReceivedState, setHasReceivedState] = React.useState(false);
    const [isSourceVisible, setIsSourceVisible] = React.useState(true);
    const [viewport, setViewport] = React.useState<Viewport>({ x: 0, y: 0, zoom: 1 });
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const sourceUpdateTimeout = React.useRef<number | undefined>(undefined);

    React.useEffect(() => {
        const onMessage = (event: MessageEvent<DiagramDocumentStateMessage>) => {
            if (event.data?.type !== "documentState") {
                return;
            }

            setHasReceivedState(true);
            setDocumentText(event.data.documentText);
            setSourceDraft(event.data.documentText);
            setGraph(event.data.graph);
            setIssues(event.data.issues ?? []);

            if (event.data.graph) {
                setNodes(toFlowNodes(event.data.graph));
                setEdges(toFlowEdges(event.data.graph));
                setViewport(event.data.graph.viewport);
            } else {
                setNodes([]);
                setEdges([]);
            }
        };

        window.addEventListener("message", onMessage);
        postToVscode({ type: "ready" });

        return () => {
            window.removeEventListener("message", onMessage);
            if (sourceUpdateTimeout.current) {
                window.clearTimeout(sourceUpdateTimeout.current);
            }
        };
    }, [setEdges, setNodes]);

    React.useEffect(() => {
        if (!hasReceivedState || sourceDraft === documentText) {
            return;
        }

        sourceUpdateTimeout.current = window.setTimeout(() => {
            postToVscode({
                type: "updateSource",
                text: sourceDraft,
            });
        }, 250);

        return () => {
            if (sourceUpdateTimeout.current) {
                window.clearTimeout(sourceUpdateTimeout.current);
            }
        };
    }, [documentText, hasReceivedState, sourceDraft]);

    const persistLayout = React.useCallback((nextNodes: Node[], nextViewport: Viewport) => {
        postToVscode({
            type: "updateLayout",
            nodes: nextNodes.map((node) => ({
                id: node.id,
                specifier: typeof node.data?.specifier === "string" ? node.data.specifier : node.id,
                x: node.position.x,
                y: node.position.y,
            })),
            viewport: nextViewport,
        });
    }, []);

    if (!hasReceivedState) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-[var(--editor-bg)] text-sm text-slate-600">
                Loading diagram editor…
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-[var(--editor-bg)] text-slate-900">
            <div className="flex items-center justify-between border-b border-[var(--panel-line)] bg-white/80 px-4 py-3 backdrop-blur-sm">
                <div>
                    <div className="font-display text-xl">{graph?.title ?? "Tonto Diagram"}</div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">
                        {graph?.packages.join(", ") || "No resolved packages"}
                    </div>
                </div>
                <button
                    type="button"
                    className="rounded-full border border-slate-300 bg-white px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-700"
                    onClick={() => setIsSourceVisible((value) => !value)}
                >
                    {isSourceVisible ? "Hide source" : "Show source"}
                </button>
            </div>

            <PanelGroup direction="horizontal" className="h-[calc(100%-65px)]">
                <Panel defaultSize={isSourceVisible ? 68 : 100} minSize={45}>
                    <div className="relative h-full w-full">
                        <ReactFlow
                            fitView
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={NODE_TYPES}
                            edgeTypes={EDGE_TYPES}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            viewport={viewport}
                            onMoveEnd={(_, nextViewport) => {
                                setViewport(nextViewport);
                                persistLayout(nodes, nextViewport);
                            }}
                            onNodeDragStop={(_, draggedNode) => {
                                const nextNodes = nodes.map((node) => node.id === draggedNode.id ? {
                                    ...node,
                                    position: draggedNode.position,
                                } : node);
                                setNodes(nextNodes);
                                persistLayout(nextNodes, viewport);
                            }}
                            className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.12)_1px,transparent_0)] [background-size:24px_24px]"
                        >
                            <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="rgba(15,23,42,0.14)" />
                            <Controls />
                        </ReactFlow>

                        {graph === undefined ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                                <div className="max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl">
                                    <div className="font-display text-xl">Diagram preview unavailable</div>
                                    <div className="mt-2 text-sm text-slate-600">
                                        Fix the source issues to render the graphic view.
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {issues.length > 0 ? (
                            <div className="absolute bottom-4 left-4 max-w-xl rounded-3xl border border-amber-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
                                <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber-700">Issues</div>
                                <div className="mt-3 space-y-2 text-sm text-slate-700">
                                    {issues.map((issue, index) => (
                                        <div key={`${issue.message}:${index}`}>
                                            <span className="font-semibold">{issue.severity.toUpperCase()}</span>
                                            {issue.line ? ` line ${issue.line}: ` : ": "}
                                            {issue.message}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </Panel>

                {isSourceVisible ? (
                    <>
                        <PanelResizeHandle className="w-px bg-[var(--panel-line)]" />
                        <Panel defaultSize={32} minSize={20}>
                            <div className="flex h-full flex-col border-l border-[var(--panel-line)] bg-white/88 backdrop-blur-sm">
                                <div className="border-b border-[var(--panel-line)] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">
                                    .tontodiagram source
                                </div>
                                <textarea
                                    value={sourceDraft}
                                    onChange={(event) => setSourceDraft(event.target.value)}
                                    className="h-full w-full resize-none border-0 bg-transparent px-4 py-4 font-mono text-[13px] leading-6 text-slate-800 outline-none"
                                    spellCheck={false}
                                />
                            </div>
                        </Panel>
                    </>
                ) : null}
            </PanelGroup>
        </div>
    );
}

function toFlowNodes(graph: TontoDiagramGraph): Node[] {
    return graph.nodes.map((node) => ({
        id: node.id,
        type: "diagram",
        position: node.position,
        data: {
            node,
            specifier: node.specifier,
            showAttributes: graph.presentation.attributes,
            showStereotypes: graph.presentation.stereotypes,
        },
    }));
}

function toFlowEdges(graph: TontoDiagramGraph): Edge[] {
    return graph.edges.map((edge) => ({
        id: edge.id,
        type: edge.kind,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        data: {
            connector: edge.connector,
            sourceCardinality: edge.sourceCardinality,
            targetCardinality: edge.targetCardinality,
            stereotype: edge.stereotype,
        },
    }));
}
