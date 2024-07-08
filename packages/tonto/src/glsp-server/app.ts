import {
    GModelStorage,
    LogLevel,
    LoggerFactory,
    SocketLaunchOptions,
    SocketServerLauncher,
    createAppModule,
    defaultSocketLaunchOptions
} from "@eclipse-glsp/server/node.js";
import { Container, ContainerModule } from "inversify";

import { AddressInfo } from "node:net";
import { URI } from "vscode-uri";

import { configureELKLayoutModule } from "@eclipse-glsp/layout-elk";
import { TontoLSPServices, TontoServices, TontoSharedServices } from "tonto-cli";
import { TontoDiagramModule, TontoServerModule } from "./tonto-diagram/tonto-diagram-module.js";


export async function startGLSPServer(services: TontoLSPServices, workspaceFolder: URI): Promise<void> {
    const launchOptions: SocketLaunchOptions = {
        ...defaultSocketLaunchOptions,
        host: "127.0.0.1",
        port: Number(process.env.TONTO_SERVER_PORT) ?? 0,
        logLevel: LogLevel.info
    };

    // Add fallback hooks to catch unhandled exceptions & promise rejections and prevent the node process from crashing
    process.on("unhandledRejection", (reason, p) => {
        logger.error("Unhandled Rejection:", p, reason);
    });

    process.on("uncaughtException", error => {
        logger.error("Uncaught exception:", error);
    });

    const appModule = createAppModule(launchOptions);
    const elkLayoutModule = configureELKLayoutModule({ algorithms: ["layered"] });
    const lspModule = createLSPModule(services);

    const appContainer = new Container();
    appContainer.load(appModule, lspModule);

    // create server
    const serverModule = new TontoServerModule()
        .configureDiagramModule(new TontoDiagramModule(() => GModelStorage), elkLayoutModule);

    const logger = appContainer.get<LoggerFactory>(LoggerFactory)("TontoServer");
    const launcher = appContainer.resolve<SocketServerLauncher>(SocketServerLauncher);
    launcher.configure(serverModule);
    await launcher.start(launchOptions);


    // try {
    //     const stop = launcher.start(launchOptions);
    //     launcher["netServer"].on(
    //         "listening", () => services.shared.lsp.Connection?.onRequest(GLSP_PORT_COMMAND, () => getPort(launcher["netServer"].address()))
    //     );
    //     return stop;
    // } catch (error) {
    //     logger.error("Error in GLSP server launcher: ", error);
    // }
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