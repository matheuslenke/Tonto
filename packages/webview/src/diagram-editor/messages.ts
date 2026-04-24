import type { TontoDiagramGraph, TontoDiagramIssue } from "tonto-cli";

export type DiagramDocumentStateMessage = {
    type: "documentState";
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
        viewport: {
            x: number;
            y: number;
            zoom: number;
        };
    };
