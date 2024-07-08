import "reflect-metadata";

import { ContainerConfiguration } from "@eclipse-glsp/protocol";
import { GLSPStarter } from "@eclipse-glsp/vscode-integration-webview";
import "@eclipse-glsp/vscode-integration-webview/css/glsp-vscode.css";
import "@vscode/codicons/dist/codicon.css";
import { Container } from "inversify";
import { createTontoDiagramContainer } from "tonto-glsp-client";

class TontoGLSPStarter extends GLSPStarter {
    protected override createContainer(...containerConfiguration: ContainerConfiguration): Container {
        console.log("Creating container");
        return createTontoDiagramContainer(...containerConfiguration);
    }
}

export function launch(): void {
    new TontoGLSPStarter();
}

launch();