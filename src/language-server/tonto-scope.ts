import { TontoQualifiedNameProvider } from "./tonto-naming";
import {
  AstNode,
  AstNodeDescription,
  DefaultScopeComputation,
  interruptAndCheck,
  LangiumDocument,
  MultiMap,
  PrecomputedScopes,
} from "langium";
import { CancellationToken } from "vscode-jsonrpc";
import {
  ContextModule,
  isClassDeclaration,
  isComplexDataType,
  isContextModule,
  isElementRelation,
  Model,
} from "./generated/ast";
import { TontoServices } from "./tonto-module";

export class TontoScopeComputation extends DefaultScopeComputation {
  qualifiedNameProvider: TontoQualifiedNameProvider;

  constructor(services: TontoServices) {
    super(services);
    this.qualifiedNameProvider = services.references.QualifiedNameProvider;
  }

  // override async computeExports(
  //   document: LangiumDocument,
  //   cancelToken = CancellationToken.None
  // ): Promise<AstNodeDescription[]> {
  //   const exportedDescriptions: AstNodeDescription[] = [];

  //   for (const childNode of streamAllContents(document.parseResult.value)) {
  //     await interruptAndCheck(cancelToken);

  //     if (
  //       isClassDeclaration(childNode) ||
  //       isElementRelation(childNode) ||
  //       isComplexDataType(childNode) ||
  //       isContextModule(childNode)
  //     ) {
  //       if (childNode.name !== undefined) {
  //         const fullyQualifiedName = this.getQualifiedName(
  //           childNode,
  //           childNode.name
  //         );

  //         exportedDescriptions.push(
  //           this.descriptions.createDescription(
  //             childNode,
  //             fullyQualifiedName,
  //             document
  //           )
  //         );
  //       }
  //     }
  //   }
  //   return exportedDescriptions;
  // }

  // private getContextModuleFromContainer(element: AstNode): ContextModule {
  //   let contextModule: AstNode;
  //   contextModule = element;
  //   while (contextModule.$type !== "ContextModule") {
  //     if (contextModule.$container === undefined) {
  //       break;
  //     }
  //     contextModule = contextModule.$container;
  //   }
  //   return contextModule as ContextModule;
  // }

  // /**
  //  * Build a qualified name for a model node
  //  */
  // private getQualifiedName(node: AstNode, name: string): string {
  //   let parent: AstNode | undefined = node.$container;

  //   while (isContextModule(parent)) {
  //     // Iteratively prepend the name of the parent contextModule
  //     // This allows us to work with nested contextModules
  //     // if (parent.stringName) {
  //     //   name = `"${parent.name}".${name}`;
  //     // } else if (parent.name) {
  //     // }
  //     name = `${parent.name}.${name}`;
  //     parent = parent.$container;
  //   }
  //   return name;
  // }

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
    for (const element of container.declarations) {
      await interruptAndCheck(cancelToken);
      if (
        isClassDeclaration(element) ||
        isComplexDataType(element) ||
        isElementRelation(element)
      ) {
        // Create a simple local name for the function
        if (element.name !== undefined) {
          const description = this.descriptions.createDescription(
            element,
            undefined,
            document
          );
          localDescriptions.push(description);
          // If it is a internal relation, also push it's qualified name from
          // the classDeclaration
          if (isClassDeclaration(element) && element.references.length > 0) {
            for (const internalElement of element.references) {
              if (isElementRelation(internalElement)) {
                const qualifiedName = `${element.name}.${internalElement.name}`;
                const internalDescription = this.descriptions.createDescription(
                  internalElement,
                  qualifiedName,
                  document
                );
                localDescriptions.push(internalDescription);
              }
            }
          }
        }
      }
    }
    scopes.addAll(container, localDescriptions);
    return localDescriptions;
  }
}
