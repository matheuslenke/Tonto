import type { TontoDiagramGraph, TontoDiagramIssue } from "tonto-cli";

export type DiagramDocumentStateStatus = "loading" | "ready" | "error";

export type DiagramDocumentStateMessage = {
    type: "documentState";
    status?: DiagramDocumentStateStatus;
    documentText: string;
    graph?: TontoDiagramGraph;
    issues: TontoDiagramIssue[];
};

export type DiagramOutgoingMessage =
    | {
        type: "ready";
    }
    | {
        type: "updateSource";
        text: string;
    }
    | {
        type: "updateLayout";
        nodes: Array<{
            id: string;
            specifier: string;
            x: number;
            y: number;
        }>;
    };
