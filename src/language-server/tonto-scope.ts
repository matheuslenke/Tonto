/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import {
  AstNode,
  AstNodeDescription,
  DefaultScopeComputation,
  interruptAndCheck,
  LangiumDocument,
  LangiumServices, MultiMap, PrecomputedScopes, streamAllContents
} from "langium";
import { CancellationToken } from "vscode-jsonrpc";
import {
  ClassDeclaration, ContextModule, Declaration, isClassDeclaration, isComplexDataType, isContextModule, isDeclaration, isElementRelation, Model
} from "./generated/ast";
import { TontoNameProvider } from "./tonto-naming";

export class TontoScopeComputation extends DefaultScopeComputation {
  constructor(services: LangiumServices) {
    super(services);
  }

  async computeLocalScopes(document: LangiumDocument<AstNode>, cancelToken?: CancellationToken | undefined): Promise<PrecomputedScopes> {
    const model = document.parseResult.value as Model;
    const scopes = new MultiMap<AstNode, AstNodeDescription>();
    await this.processContainer(model, scopes, document, cancelToken);

    return scopes;
  }

  protected async processContainer(
    container: Model | ContextModule,
    scopes: PrecomputedScopes,
    document: LangiumDocument,
    cancelToken?: CancellationToken
  ): Promise<AstNodeDescription[]> {
    const localDescriptions: AstNodeDescription[] = [];
    let elements: Array<ContextModule | Declaration> = [];
    if (container.$type === "Model") {
      const model = container as Model;
      elements = [...elements, ...model.modules];
    } else {
      const contextModule = container as ContextModule;
      elements = [...elements, ...contextModule.declarations];
    }
    for (const declaration of elements) {
      if (cancelToken) {
        await interruptAndCheck(cancelToken);
      }
      if (
        isDeclaration(declaration) ||
        isComplexDataType(declaration) ||
        isElementRelation(declaration) ||
        isClassDeclaration(declaration)
      ) {
        if (declaration.name) {
          const description = this.descriptions.createDescription(
            declaration,
            declaration.name,
            document
          );
          localDescriptions.push(description);
        }
      } else if (isContextModule(declaration)) {
        const nestedDescriptions = await this.processContainer(
          declaration,
          scopes,
          document,
          cancelToken
        );
        for (const description of nestedDescriptions) {
          // Add qualified names to the container
          const qualified = this.createQualifiedDescription(
            declaration,
            description,
            document
          );
          localDescriptions.push(qualified);
        }
      }
    }
    scopes.addAll(container, localDescriptions);
    return localDescriptions;
  }

  protected createQualifiedDescription(
    pack: ContextModule | ClassDeclaration,
    description: AstNodeDescription,
    document: LangiumDocument
  ): AstNodeDescription {
    const name = (this.nameProvider as TontoNameProvider).getQualifiedName(
      pack.name,
      description.name
    );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.descriptions.createDescription(
            description.node!,
            name,
            document
    );
  }

  /**
 * Exports only types (`DataType or `Entity`) with their qualified names.
 */
  async createDescriptions(
    document: LangiumDocument,
    cancelToken = CancellationToken.None
  ): Promise<AstNodeDescription[]> {
    const descr: AstNodeDescription[] = [];
    for (const modelNode of streamAllContents(document.parseResult.value)) {
      await interruptAndCheck(cancelToken);
      if (isDeclaration(modelNode) || isClassDeclaration(modelNode)) {
        let name = this.nameProvider.getName(modelNode);
        if (name) {
          if (isContextModule(modelNode.$container)) {
            name = (this.nameProvider as TontoNameProvider).getQualifiedName(
                            modelNode.$container as ContextModule,
                            name
            );
          }
          descr.push(this.descriptions.createDescription(modelNode, name, document));
        }
      }
    }
    return descr;
  }
}
