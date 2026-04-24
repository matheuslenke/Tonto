/* eslint-disable @typescript-eslint/no-explicit-any */
import { DefaultLanguageServer } from "langium/lsp";
import {
    InitializeParams,
    InitializeResult,
    InitializedParams
} from "vscode-languageserver";
import {
    ConfigurationItem,
    DidChangeConfigurationNotification,
    DidChangeConfigurationRegistrationOptions
} from "vscode-languageserver-protocol";
import { TontoSemanticTokenOptions } from "./semantic-token-types.js";

type ConfigurationInitializationParams = InitializedParams & {
    register?: (params: DidChangeConfigurationRegistrationOptions) => void;
    fetchConfiguration?: (configuration: ConfigurationItem[]) => Promise<unknown>;
};

const OPERATION_CANCELLED_DESCRIPTION = "OperationCancelled";

export class TontoLanguageServer extends DefaultLanguageServer {
    protected override buildInitializeResult(_params: InitializeParams): InitializeResult<any> {
        const result = super.buildInitializeResult(_params);
        result.capabilities.semanticTokensProvider = TontoSemanticTokenOptions;
        return result;
    }

    protected override fireInitializedOnDefaultServices(params: InitializedParams): void {
        const connection = this.services.lsp.Connection;
        const configurationParams: ConfigurationInitializationParams = connection
            ? {
                ...params,
                register: (registrationParams) => connection.client.register(DidChangeConfigurationNotification.type, registrationParams),
                fetchConfiguration: (sectionParams) => connection.workspace.getConfiguration(sectionParams),
            }
            : params;

        this.services.workspace.ConfigurationProvider.initialized(configurationParams)
            .catch((error) => console.error("Error in ConfigurationProvider initialization:", error));
        this.services.workspace.WorkspaceManager.initialized(params)
            .catch((error) => {
                if (!isOperationCancelledSymbol(error)) {
                    console.error("Error in WorkspaceManager initialization:", error);
                }
            });
    }
}

function isOperationCancelledSymbol(error: unknown): boolean {
    if (typeof error === "symbol") {
        return error.description === OPERATION_CANCELLED_DESCRIPTION || String(error) === `Symbol(${OPERATION_CANCELLED_DESCRIPTION})`;
    }

    if (error && typeof error === "object") {
        const candidate = error as {
            cause?: unknown;
            description?: unknown;
            message?: unknown;
            name?: unknown;
            toString?: () => string;
        };

        if (candidate.description === OPERATION_CANCELLED_DESCRIPTION || candidate.name === OPERATION_CANCELLED_DESCRIPTION || candidate.message === OPERATION_CANCELLED_DESCRIPTION) {
            return true;
        }

        if (candidate.toString?.() === `Symbol(${OPERATION_CANCELLED_DESCRIPTION})`) {
            return true;
        }

        if (candidate.cause) {
            return isOperationCancelledSymbol(candidate.cause);
        }
    }

    return String(error) === `Symbol(${OPERATION_CANCELLED_DESCRIPTION})`;
}
