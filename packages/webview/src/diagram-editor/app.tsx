import * as React from "react";
import {
    Background,
    BackgroundVariant,
    Controls,
    ReactFlow,
    ReactFlowProvider,
    type Edge,
    type Node,
    useEdgesState,
    useNodesInitialized,
    useNodesState,
    useReactFlow,
} from "@xyflow/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { TontoDiagramGraph, TontoDiagramIssue } from "tonto-cli";
import { DiagramNode } from "./components/diagram-node";
import { RelationEdge } from "./components/relation-edge";
import { SpecializationEdge } from "./components/specialization-edge";
import type { DiagramDocumentStateMessage, DiagramDocumentStateStatus } from "./messages";
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
    const [status, setStatus] = React.useState<DiagramDocumentStateStatus>("loading");
    const [issues, setIssues] = React.useState<TontoDiagramIssue[]>([]);
    const [hasReceivedState, setHasReceivedState] = React.useState(false);
    const [isSourceVisible, setIsSourceVisible] = React.useState(true);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const reactFlow = useReactFlow();
    const nodesInitialized = useNodesInitialized();
    const sourceUpdateTimeout = React.useRef<number | undefined>(undefined);
    const hasFitInitialGraph = React.useRef(false);
    const canvasDescriptionId = React.useId();

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
            setStatus(resolveDocumentStatus(event.data));

            if (event.data.graph) {
                setNodes(toFlowNodes(event.data.graph));
                setEdges(toFlowEdges(event.data.graph));
            } else {
                setNodes([]);
                setEdges([]);
                hasFitInitialGraph.current = false;
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

    React.useEffect(() => {
        if (!graph || !nodesInitialized || hasFitInitialGraph.current) {
            return;
        }

        hasFitInitialGraph.current = true;
        void reactFlow.fitView({
            padding: 0.16,
            maxZoom: 1,
            duration: 0,
        });
    }, [graph, nodesInitialized, reactFlow]);

    const persistNodeLayout = React.useCallback((nextNodes: Node[]) => {
        postToVscode({
            type: "updateLayout",
            nodes: nextNodes.map((node) => ({
                id: node.id,
                specifier: typeof node.data?.specifier === "string" ? node.data.specifier : node.id,
                x: node.position.x,
                y: node.position.y,
            })),
        });
    }, []);

    if (!hasReceivedState) {
        return (
            <DiagramStartupView />
        );
    }

    const isLoading = status === "loading";
    const isBlockingError = !isLoading && graph === undefined;
    const shouldShowIssuesPanel = issues.length > 0 && !isBlockingError;

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
                        <div id={canvasDescriptionId} className="sr-only">
                            {getCanvasDescription(graph)}
                        </div>
                        <ReactFlow
                            fitView
                            fitViewOptions={{
                                padding: 0.16,
                                maxZoom: 1,
                            }}
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={NODE_TYPES}
                            edgeTypes={EDGE_TYPES}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onNodeDragStop={(_, draggedNode) => {
                                const nextNodes = nodes.map((node) => node.id === draggedNode.id ? {
                                    ...node,
                                    position: draggedNode.position,
                                } : node);
                                setNodes(nextNodes);
                                persistNodeLayout(nextNodes);
                            }}
                            aria-label={graph ? `${graph.title} diagram canvas` : "Tonto diagram canvas"}
                            aria-describedby={canvasDescriptionId}
                            role="region"
                            tabIndex={0}
                            nodesFocusable
                            edgesFocusable
                            nodesConnectable={false}
                            edgesReconnectable={false}
                            onlyRenderVisibleElements
                            className="h-full w-full bg-white"
                        >
                            <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="rgba(148,163,184,0.52)" />
                            <Controls />
                        </ReactFlow>
                        <CanvasCenterMark />

                        {isLoading ? (
                            <DiagramFeedbackView
                                variant="loading"
                                title="Building diagram"
                                message="Resolving the source model and layout."
                            />
                        ) : null}

                        {isBlockingError ? (
                            <DiagramFeedbackView
                                variant="error"
                                title="Diagram cannot be rendered"
                                message="Fix the reported errors and the preview will update."
                                issues={issues}
                            />
                        ) : null}

                        {shouldShowIssuesPanel ? (
                            <div className="absolute bottom-4 left-4 max-w-xl rounded-lg border border-amber-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
                                <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber-700">Issues</div>
                                <div className="mt-3 space-y-2 text-sm text-slate-700">
                                    {issues.map((issue, index) => (
                                        <div key={`${issue.message}:${index}`} className="break-words">
                                            {formatIssue(issue)}
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

function CanvasCenterMark() {
    return (
        <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2"
            aria-hidden="true"
        >
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-500/45" />
            <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-slate-500/45" />
            <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-500/60 bg-white" />
        </div>
    );
}

function getCanvasDescription(graph: TontoDiagramGraph | undefined): string {
    if (!graph) {
        return "The Tonto diagram canvas is loading.";
    }

    return `${graph.title} contains ${graph.nodes.length} nodes and ${graph.edges.length} edges.`;
}

function DiagramStartupView() {
    return (
        <div className="flex h-full w-full items-center justify-center bg-[var(--editor-bg)] px-4 text-slate-900">
            <DiagramFeedbackCard
                variant="loading"
                title="Loading diagram editor"
                message="Preparing the .tontodiagram visualization."
            />
        </div>
    );
}

type DiagramFeedbackViewProps = {
    variant: "loading" | "error";
    title: string;
    message: string;
    issues?: TontoDiagramIssue[];
};

function DiagramFeedbackView(props: DiagramFeedbackViewProps) {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-white/75 px-4 backdrop-blur-sm">
            <DiagramFeedbackCard {...props} />
        </div>
    );
}

function DiagramFeedbackCard({ variant, title, message, issues = [] }: DiagramFeedbackViewProps) {
    const visibleIssues = issues.slice(0, 5);
    const remainingIssueCount = issues.length - visibleIssues.length;

    return (
        <div
            className="w-full max-w-lg rounded-lg border border-slate-200 bg-white/95 p-5 shadow-xl"
            role={variant === "error" ? "alert" : "status"}
            aria-live={variant === "error" ? "assertive" : "polite"}
        >
            <div className="flex items-start gap-3">
                {variant === "loading" ? (
                    <div
                        className="mt-1 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800"
                        aria-hidden="true"
                    />
                ) : (
                    <div
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-mono text-sm font-semibold text-red-700"
                        aria-hidden="true"
                    >
                        !
                    </div>
                )}
                <div className="min-w-0">
                    <div className="font-display text-xl leading-tight text-slate-950">{title}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{message}</div>
                </div>
            </div>

            {visibleIssues.length > 0 ? (
                <div className="mt-4 space-y-2 rounded-md border border-red-100 bg-red-50/80 p-3 text-sm text-red-950">
                    {visibleIssues.map((issue, index) => (
                        <div key={`${issue.message}:${index}`} className="break-words">
                            {formatIssue(issue)}
                        </div>
                    ))}
                    {remainingIssueCount > 0 ? (
                        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-red-700">
                            {remainingIssueCount} more issue{remainingIssueCount === 1 ? "" : "s"}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

function formatIssue(issue: TontoDiagramIssue): string {
    const location = typeof issue.line === "number" ? ` line ${issue.line}` : "";
    return `${issue.severity.toUpperCase()}${location}: ${issue.message}`;
}

function resolveDocumentStatus(message: DiagramDocumentStateMessage): DiagramDocumentStateStatus {
    if (message.status) {
        return message.status;
    }

    if (message.graph) {
        return "ready";
    }

    return message.issues?.some((issue) => issue.severity === "error") ? "error" : "loading";
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
