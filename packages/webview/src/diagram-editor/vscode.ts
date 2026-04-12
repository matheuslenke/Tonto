import { DiagramOutgoingMessage } from "./messages";

const vscodeApi = typeof acquireVsCodeApi === "function" ? acquireVsCodeApi() : undefined;

export function postToVscode(message: DiagramOutgoingMessage): void {
    vscodeApi?.postMessage(message);
}
