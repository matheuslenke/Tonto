import { TontoQualifiedNameProvider } from "./tonto-naming";
import {
  AstNode,
  AstNodeDescription,
  DefaultScopeComputation,
  interruptAndCheck,
  LangiumDocument,
  MultiMap,
  PrecomputedScopes,
  streamAllContents,
} from "langium";
import { CancellationToken } from "vscode-jsonrpc";
import {
  ContextModule,
  isClassDeclaration,
  isComplexDataType,
  isContextModule,
  isElementRelation,
  isEnum,
  isGeneralizationSet,
  Model,
} from "./generated/ast";
import { TontoServices } from "./tonto-module";

export class TontoScopeComputation extends DefaultScopeComputation {
  qualifiedNameProvider: TontoQualifiedNameProvider;

  constructor(services: TontoServices) {
    super(services);
    this.qualifiedNameProvider = services.references.QualifiedNameProvider;
  }

  /**
   * Computes all scopes for the given document in order to export it globally. In Tonto,
   * this is done only for ContextModules that are global
   * @param document 
   * @param cancelToken 
   * @returns An array of AstNodeDescriptions
   */
  override async computeExports(
    document: LangiumDocument,
    cancelToken = CancellationToken.None
  ): Promise<AstNodeDescription[]> {
    const descr: AstNodeDescription[] = [];
    for (const childNode of streamAllContents(document.parseResult.value)) {
      await interruptAndCheck(cancelToken);

      /**
       * Export element Relations with their qualified name if they are in a
       * ContextModule and the ContextModule is global.
       */
      if (isElementRelation(childNode)) {
        const contextModule = this.getContextModuleFromContainer(childNode);
        let name: string | undefined;

        if (isClassDeclaration(childNode.$container)) {
          name = this.qualifiedNameProvider.getQualifiedName(childNode);
        } else {
          name = childNode.name;
        }
        if (name && contextModule.isGlobal)
          descr.push(this.descriptions.createDescription(childNode, name, document));
      }

      if (
        isClassDeclaration(childNode) ||
        isComplexDataType(childNode) ||
        isContextModule(childNode) ||
        isGeneralizationSet(childNode)
      ) {
        if (
          isContextModule(childNode.$container) &&
          childNode.$container.isGlobal
        ) {
          descr.push(
            this.descriptions.createDescription(
              childNode,
              childNode.name,
              document
            )
          );
        } else if (isContextModule(childNode) && !childNode.isGlobal) {
          if (childNode.name !== undefined) {
            const fullyQualifiedName = this.qualifiedNameProvider.getQualifiedName(
              childNode
            );

            descr.push(
              this.descriptions.createDescription(
                childNode,
                fullyQualifiedName,
                document
              )
            );
          }
        }
      }
    }
    return descr;
  }

  /**
   * Compute all the local scopes for the given document
   * @param document the current document
   * @param cancelToken 
   * @returns PrecomputedScopes
   */
  async computeLocalScopes(
    document: LangiumDocument<AstNode>,
    cancelToken = CancellationToken.None
  ): Promise<PrecomputedScopes> {
    const model = document.parseResult.value as Model;
    const scopes = new MultiMap<AstNode, AstNodeDescription>();

    for (const importItem of model.imports) {
      const contextModule = importItem.referencedModel.ref;
      if (contextModule) {
        await this.processContainer(
          contextModule,
          scopes,
          document,
          cancelToken
        );
      }
    }
    await this.processContainer(model.module, scopes, document, cancelToken);

    const otherAstNodeDescriptions: AstNodeDescription[] = [];
    scopes.forEach((scope, key) => {
      if (isContextModule(key)) {
        if (key.name !== model.module.name) {
          otherAstNodeDescriptions.push(scope);
        }
      }
    });

    scopes.addAll(model.module, otherAstNodeDescriptions);

    return scopes;
  }

  private async processContainer(
    container: ContextModule,
    scopes: PrecomputedScopes,
    document: LangiumDocument,
    cancelToken: CancellationToken
  ): Promise<AstNodeDescription[]> {
    const localDescriptions: AstNodeDescription[] = [];
    if (!container) {
      return localDescriptions;
    }
    for (const element of container.declarations) {
      await interruptAndCheck(cancelToken);
      if (isElementRelation(element)) {
        const name = this.qualifiedNameProvider.getQualifiedName(element);
        if (name) {
          const description = this.descriptions.createDescription(
            element,
            name,
            document
          );
          localDescriptions.push(description);
        }
      }
      if (
        isClassDeclaration(element) ||
        isComplexDataType(element) ||
        isEnum(element)
      ) {
        if (element.name !== undefined) {
          const description = this.descriptions.createDescription(
            element,
            this.qualifiedNameProvider.getName(element),
            document
          );
          localDescriptions.push(description);
          if (isClassDeclaration(element) && element.references.length > 0) {
            for (const internalElement of element.references) {
              if (isElementRelation(internalElement)) {
                const name = this.qualifiedNameProvider.getQualifiedName(internalElement);
                if (name) {
                  const internalDescription = this.descriptions.createDescription(
                    internalElement,
                    name,
                    document
                  );
                  localDescriptions.push(internalDescription);
                }
              }
            }
          }
        }
      }
    }
    scopes.addAll(container, localDescriptions);
    return localDescriptions;
  }

  private getContextModuleFromContainer(element: AstNode): ContextModule {
    let contextModule: AstNode;
    contextModule = element;
    while (contextModule.$type !== "ContextModule") {
      if (contextModule.$container === undefined) {
        break;
      }
      contextModule = contextModule.$container;
    }
    return contextModule as ContextModule;
  }
}
