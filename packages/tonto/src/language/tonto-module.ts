import { AstNode, DefaultServiceRegistry, Hydrator, JsonSerializer, Module, ServiceRegistry, TextDocument, inject } from "langium";
import { LangiumSprottyServices } from "langium-sprotty";
import { DefaultSharedModuleContext, LangiumServices, LangiumSharedServices, PartialLangiumServices, PartialLangiumSharedServices, createDefaultModule, createDefaultSharedModule } from "langium/lsp";
import "reflect-metadata";
import { URI } from "vscode-uri";
import { AddedSharedModelServices } from "../model-server/model-module.js";
import { ModelService } from "../model-server/model-service.js";
import { OpenTextDocumentManager } from "../model-server/open-text-document-manager.js";
import { OpenableTextDocuments } from "../model-server/openable-text-document.js";
import { Serializer } from "../model-server/serializer.js";
import { TontoGeneratedModule, TontoGeneratedSharedModule } from "./generated/module.js";
import { TontoActionProvider } from "./lsp/tonto-code-actions.js";
import { TontoCompletionProvider } from "./lsp/tonto-completion-provider.js";
import { TontoHoverProvider } from "./lsp/tonto-hover-provider.js";
import { TontoLanguageServer } from "./lsp/tonto-language-server.js";
import { TontoParserErrorMessageProvider } from "./lsp/tonto-parser-error-message-provider.ts.js";
import { TontoSemanticTokenProvider } from "./lsp/tonto-semantic-token-provider.js";
import { TontoIndexManager } from "./references/tonto-index-manager.js";
import { TontoQualifiedNameProvider } from "./references/tonto-name-provider.js";
import { TontoPackageManager } from "./references/tonto-package-manager.js";
import { TontoScopeComputation } from "./references/tonto-scope-computation.js";
import { TontoScopeProvider } from "./references/tonto-scope-provider.js";
import { TontoSerializer } from "./serializer/tonto-serializer.js";
import { ClientLogger } from "./tonto-client-logger.js";
import { TontoValidationRegistry } from "./tonto-validator.js";
import { TontoValidator } from "./validators/TontoValidator.js";
import { TontoLangiumDocuments } from "./workspace/tonto-langium-documents.js";
import { TontoWorkspaceManager } from "./workspace/tonto-workspace-manager.js";

/***************************
 * Shared Module
 ***************************/
export interface ExtendedLangiumServices extends LangiumServices {
    serializer: {
        JsonSerializer: JsonSerializer;
        Serializer: Serializer<AstNode>;
        Hydrator: Hydrator;
    }
}

export class DefaultExtendedServiceRegistry extends DefaultServiceRegistry {
    override register(language: ExtendedLangiumServices): void {
        super.register(language);
    }

    override getServices(uri: URI): ExtendedLangiumServices {
        return super.getServices(uri) as ExtendedLangiumServices;
    }
}

export interface ExtendedServiceRegistry extends ServiceRegistry {
    register(language: ExtendedLangiumServices): void;
    getServices(uri: URI): ExtendedLangiumServices;
}

/**
 * Declaration of custom services - add your own service classes here.
 */
export interface TontoAddedSharedServices {
    ServiceRegistry: ExtendedServiceRegistry;

    workspace: {
        WorkspaceManager: TontoWorkspaceManager;
        TextDocumentManager: OpenTextDocumentManager;
        LangiumDocuments: TontoLangiumDocuments;
        IndexManager: TontoIndexManager;
        PackageManager: TontoPackageManager;
    }
    logger: {
        ClientLogger: ClientLogger;
    };
    lsp: {
        LanguageServer: TontoLanguageServer;
    };
}

export const TontoSharedServices = Symbol("TontoSharedServices");
export type TontoSharedServices = Omit<LangiumSharedServices, "ServiceRegistry"> &
    TontoAddedSharedServices &
    AddedSharedModelServices & {
        Tonto: TontoServices;
    }

export const TontoSharedModule: Module<
    TontoSharedServices,
    PartialLangiumSharedServices & TontoAddedSharedServices & AddedSharedModelServices> = {
    ServiceRegistry: () => new DefaultExtendedServiceRegistry(),
    workspace: {
        WorkspaceManager: services => new TontoWorkspaceManager(services),
        TextDocuments: services => new OpenableTextDocuments(TextDocument, services),
        TextDocumentManager: (services: TontoSharedServices) => new OpenTextDocumentManager(services),
        LangiumDocuments: services => new TontoLangiumDocuments(services),
        IndexManager: services => new TontoIndexManager(services),
        PackageManager: services => new TontoPackageManager(services),
    },
    logger: {
        ClientLogger: services => new ClientLogger(services)
    },
    model: {
        ModelService: services => new ModelService(services)
    },
    lsp: {
        LanguageServer: services => new TontoLanguageServer(services)
    }
};

/***************************
 * Language Module
 ***************************/

export interface TontoModuleContext {
    shared: TontoSharedServices;
}

/**
 * Declaration of custom services - add your own service classes here.
 */
export type TontoAddedServices = {
    references: {
        QualifiedNameProvider: TontoQualifiedNameProvider;
        ScopeProvider: TontoScopeProvider;
        ScopeComputation: TontoScopeComputation;
    },
    validation: {
        TontoValidator: TontoValidator;
    },
    serializer: {
        Serializer: TontoSerializer;
    };
    shared: TontoSharedServices;
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type TontoServices = LangiumServices & TontoAddedServices & LangiumSprottyServices
export const TontoServices = Symbol("TontoServices");
/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export function createTontoModule(context: TontoModuleContext): Module<TontoServices, PartialLangiumServices & TontoAddedServices> {
    return {
        references: {
            ScopeComputation: (services: TontoServices) => new TontoScopeComputation(services),
            QualifiedNameProvider: (services) => new TontoQualifiedNameProvider(services),
            ScopeProvider: (services: TontoServices) => new TontoScopeProvider(services),
        },
        validation: {
            ValidationRegistry: (services: TontoServices) => new TontoValidationRegistry(services),
            TontoValidator: () => new TontoValidator(),
        },
        lsp: {
            CodeActionProvider: () => new TontoActionProvider(),
            // Formatter: () => new TontoFormatter(),
            SemanticTokenProvider: (services) => new TontoSemanticTokenProvider(services),
            CompletionProvider: (services) => new TontoCompletionProvider(services),
            HoverProvider: (services) => new TontoHoverProvider(services),
        },
        parser: {
            ParserErrorMessageProvider: () => new TontoParserErrorMessageProvider(),
        },
        serializer: {
            Serializer: () => new TontoSerializer()
        },
        shared: () => context.shared
    };
}

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */

export function createTontoServices(context: DefaultSharedModuleContext): {
    shared: TontoSharedServices,
    Tonto: TontoServices
} {
    const shared = inject(
        createDefaultSharedModule(context),
        TontoGeneratedSharedModule,
        TontoSharedModule,
    );
    const Tonto = inject(
        createDefaultModule({ shared }),
        TontoGeneratedModule,
        createTontoModule({ shared })
    );
    shared.ServiceRegistry.register(Tonto);
    shared.Tonto = Tonto;
    return { shared, Tonto: Tonto };
}
