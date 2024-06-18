import {
    LogLevel,
    ServerModule,
    SocketLaunchOptions,
    createAppModule,
    defaultSocketLaunchOptions
} from "@eclipse-glsp/server/node.js";
import { Container, ContainerModule } from "inversify";
import { MaybePromise } from "langium";
import { URI } from "vscode-uri";
import { TontoLSPServices } from "../integration.js";
import { TontoServices, TontoSharedServices } from "../language/index.js";
import { TontoDiagramModule } from "./tonto-diagram/tonto-diagram-module.js";
export function startGLSPServer(services: TontoLSPServices, workspaceFolder: URI): MaybePromise<void> {
    const launchOptions: SocketLaunchOptions = {
        ...defaultSocketLaunchOptions,
        host: "127.0.0.1",
        logLevel: LogLevel.info
    };

    const appModule = createAppModule(launchOptions);

    const lspModule = createLSPModule(services);

    const appContainer = new Container();
    appContainer.load(appModule, lspModule);

    // create server
    // const serverModule = 
    new ServerModule()
        .configureDiagramModule(new TontoDiagramModule());
}

// function getPort(address: AddressInfo | string | null): number | undefined {
//     return address && !(typeof address === "string") ? address.port : undefined;
// }

/**
 * Custom module to bind language services so that they can be injected in other classes created through DI.
 *
 * @param services language services
 * @returns container module
 */
export function createLSPModule(services: TontoLSPServices): ContainerModule {
    return new ContainerModule(bind => {
        bind(TontoLSPServices).toConstantValue(services);
        bind(TontoSharedServices).toConstantValue(services.shared);
        bind(TontoServices).toConstantValue(services.language);
    });
}