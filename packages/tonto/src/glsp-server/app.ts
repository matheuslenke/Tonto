import {
    LogLevel,
    LoggerFactory,
    MaybePromise,
    SocketLaunchOptions,
    SocketServerLauncher,
    createAppModule,
    defaultSocketLaunchOptions
} from "@eclipse-glsp/server/node.js";
import { Container, ContainerModule } from "inversify";

import { AddressInfo } from "node:net";
import { URI } from "vscode-uri";

import { TontoLSPServices, TontoServices, TontoSharedServices } from "tonto-cli";
import { GLSP_PORT_COMMAND } from "./protocol/integration.js";
import { TontoDiagramModule, TontoServerModule } from "./tonto-diagram/tonto-diagram-module.js";


export function startGLSPServer(services: TontoLSPServices, workspaceFolder: URI): MaybePromise<void> {
    const launchOptions: SocketLaunchOptions = {
        ...defaultSocketLaunchOptions,
        host: "127.0.0.1",
        port: Number(process.env.TONTO_SERVER_PORT) ?? 0,
        logLevel: LogLevel.info
    };

    const appModule = createAppModule(launchOptions);
    // const elkLayoutModule = configureELKLayoutModule({ algorithms: ["layered"] });
    const lspModule = createLSPModule(services);

    const appContainer = new Container();
    appContainer.load(appModule, lspModule);

    // create server
    const serverModule = new TontoServerModule()
        .configureDiagramModule(new TontoDiagramModule());

    const logger = appContainer.get<LoggerFactory>(LoggerFactory)("TontoServer");
    const launcher = appContainer.resolve<SocketServerLauncher>(SocketServerLauncher);
    launcher.configure(serverModule);

    try {
        const stop = launcher.start(launchOptions);
        launcher["netServer"].on(
            "listening", () => services.shared.lsp.Connection?.onRequest(GLSP_PORT_COMMAND, () => getPort(launcher["netServer"].address()))
        );
        return stop;
    } catch (error) {
        logger.error("Error in GLSP server launcher: ", error);
    }

    process.on("unhandledRejection", error => console.log("Unhandled rejection", error));
}

function getPort(address: AddressInfo | string | null): number | undefined {
    return address && !(typeof address === "string") ? address.port : undefined;
}

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