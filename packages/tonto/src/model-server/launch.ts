import * as net from "node:net";
import * as rpc from "vscode-jsonrpc/node.js";
import { URI } from "vscode-uri";
import { MODELSERVER_PORT_COMMAND } from "../glsp-server/index.js";
import { TontoLSPServices } from "../integration.js";
import { ModelServer } from "./model-server.js";

const currentConnections: rpc.MessageConnection[] = [];

export function startModelServer(services: TontoLSPServices, workspaceFolder: URI): Promise<void> {
    const netServer = net.createServer(socket => createClientConnection(socket, services));
    netServer.listen(0);
    netServer.on("listening", () => {
        console.log("Received request to start model server");
        const addressInfo = netServer.address();
        if (!addressInfo) {
            console.error("[ModelServer] Could not resolve address info. Shutting down.");
            close(netServer);
            return;
        } else if (typeof addressInfo === "string") {
            console.error(`[ModelServer] Unexpectedly listening to pipe or domain socket "${addressInfo}". Shutting down.`);
            close(netServer);
            return;
        }
        console.log(`[ModelServer] Ready to accept new client requests on port: ${addressInfo.port}`);
        services.shared.lsp.Connection?.onRequest(MODELSERVER_PORT_COMMAND, () => addressInfo.port);
    });
    netServer.on("error", err => {
        console.error("[ModelServer] Error: ", err);
        close(netServer);
    });
    return new Promise((resolve, reject) => {
        netServer.on("close", () => resolve(undefined));
        netServer.on("error", error => reject(error));
    });
}

/**
 * Create a new connection for an incoming client on the given socket. Each client gets their own connection and model server instance.
 *
 * @param socket socket connection
 * @param services language services
 * @returns a promise that is resolved as soon as the connection is closed or rejects if an error occurs
 */
async function createClientConnection(socket: net.Socket, services: TontoLSPServices): Promise<void> {
    console.info(`[ModelServer] Starting model server connection for client: '${socket.localAddress}'`);
    const connection = createConnection(socket);
    currentConnections.push(connection);

    const modelServer = new ModelServer(connection, services.shared.model.ModelService);
    connection.onDispose(() => modelServer.dispose());
    socket.on("close", () => modelServer.dispose());

    connection.listen();
    console.info(`[ModelServer] Connecting to client: '${socket.localAddress}'`);

    return new Promise((resolve, rejects) => {
        connection.onClose(() => resolve(undefined));
        connection.onError((error: unknown) => rejects(error));
    });
}

/**
 * Creates an RPC-message connection for the given socket.
 *
 * @param socket socket
 * @returns message connection
 */
function createConnection(socket: net.Socket): rpc.MessageConnection {
    return rpc.createMessageConnection(new rpc.SocketMessageReader(socket), new rpc.SocketMessageWriter(socket), console);
}

/**
 * Closes the server.
 *
 * @param netServer server to be closed
 */
function close(netServer: net.Server): void {
    currentConnections.forEach(connection => connection.dispose());
    netServer.close();
}