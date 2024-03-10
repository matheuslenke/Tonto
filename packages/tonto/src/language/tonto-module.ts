import { Module, inject } from "langium"
import { DefaultSharedModuleContext, LangiumServices, LangiumSharedServices, PartialLangiumServices, PartialLangiumSharedServices, createDefaultModule, createDefaultSharedModule } from "langium/lsp"
import { TontoGeneratedModule, TontoGeneratedSharedModule } from "./index.js"
import { TontoActionProvider } from "./lsp/tonto-code-actions.js"
import { TontoQualifiedNameProvider } from "./references/tonto-name-provider.js"
import { TontoScopeComputation } from "./references/tonto-scope-computation.js"
import { TontoScopeProvider } from "./references/tonto-scope-provider.js"
import { TontoValidationRegistry } from "./tonto-validator.js"
import { TontoValidator } from "./validators/TontoValidator.js"



/**
 * Declaration of custom services - add your own service classes here.
 */
export type TontoAddedServices = {
  references: {
    QualifiedNameProvider: TontoQualifiedNameProvider
  }
  validation: {
    TontoValidator: TontoValidator
  }
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type TontoServices = LangiumServices & TontoAddedServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const TontoModule: Module<TontoServices, PartialLangiumServices & TontoAddedServices> = {
  references: {
    ScopeComputation: (services: TontoServices) => new TontoScopeComputation(services),
    QualifiedNameProvider: () => new TontoQualifiedNameProvider(),
    NameProvider: () => new TontoQualifiedNameProvider(),
    ScopeProvider: (services: TontoServices) => new TontoScopeProvider(services),
  },
  validation: {
    ValidationRegistry: (services: TontoServices) => new TontoValidationRegistry(services),
    TontoValidator: () => new TontoValidator(),
  },
  lsp: {
    CodeActionProvider: () => new TontoActionProvider(),
    // Formatter: () => new TontoFormatter(),
    // SemanticTokenProvider: (services) => new TontoSemanticTokenProvider(services),
    // CompletionProvider: (services) => new TontoCompletionProvider(services),
  },
};

export type TontoSharedServices = LangiumSharedServices

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
export function createTontoServices(
  context: DefaultSharedModuleContext,
  sharedModule?: Module<TontoSharedServices, PartialLangiumSharedServices>
): {
  shared: LangiumSharedServices
  Tonto: TontoServices
} {
  const shared = inject(createDefaultSharedModule(context), TontoGeneratedSharedModule, sharedModule);
  const services = inject(createDefaultModule({ shared }), TontoGeneratedModule, TontoModule);
  shared.ServiceRegistry.register(services);
  return { shared, Tonto: services };
}
