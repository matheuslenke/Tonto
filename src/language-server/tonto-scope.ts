/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

 import { AstNode, AstNodeDescription, DefaultScopeComputation, interruptAndCheck, LangiumDocument, LangiumServices, PrecomputedScopes, MultiMap } from 'langium';
 import { CancellationToken } from 'vscode-jsonrpc';
 import { TontoNameProvider } from './tonto-naming';
 import { Model, ContextModule, isContextModule, isElement, isDataType, isClassElement, isElementReference, ClassElement, Element } from './generated/ast';
 
 export class TontoScopeComputation extends DefaultScopeComputation {
 
     constructor(services: LangiumServices) {
         super(services);
     }
 
     async computeScope(document: LangiumDocument, cancelToken = CancellationToken.None): Promise<PrecomputedScopes> {
         const model = document.parseResult.value as Model;
         const scopes = new MultiMap<AstNode, AstNodeDescription>();
         await this.processContainer(model, scopes, document, cancelToken);

         return scopes;
     }
 
     protected async processContainer(container: Model | ContextModule, scopes: PrecomputedScopes, document: LangiumDocument, cancelToken: CancellationToken): Promise<AstNodeDescription[]> {
        // const localDescriptions: AstNodeDescription[] = [];
        // for (const element of container.elements) {
        //     await interruptAndCheck(cancelToken);
        //     if (isType(element)) {
        //         const description = this.descriptions.createDescription(element, element.name, document);
        //         localDescriptions.push(description);
        //     } else if (isPackageDeclaration(element)) {
        //         const nestedDescriptions = await this.processContainer(element, scopes, document, cancelToken);
        //         for (const description of nestedDescriptions) {
        //             // Add qualified names to the container
        //             const qualified = this.createQualifiedDescription(element, description, document);
        //             localDescriptions.push(qualified);
        //         }
        //     }
        // }
        // scopes.addAll(container, localDescriptions);
        // return localDescriptions;

         const localDescriptions: AstNodeDescription[] = [];
         let elements: (ContextModule | Element)[] = []
         if (container.$type === 'Model') {
            const model = container as Model
            elements = [...elements, ...model.modules]
         } else {
            const contextModule = container as ContextModule
            elements = [...elements, ...contextModule.elements]
         }
         for (const element of elements) {
             await interruptAndCheck(cancelToken);
             if (isElement(element) || isDataType(element) || isElementReference(element) || isClassElement(element)) {
                if (element.name) {
                    // console.log(element.name)
                    const description = this.descriptions.createDescription(element, element.name, document);
                    localDescriptions.push(description);
                }
             } else if (isContextModule(element)) {
                 const nestedDescriptions = await this.processContainer(element, scopes, document, cancelToken);
                 for (const description of nestedDescriptions) {
                     // Add qualified names to the container
                     const qualified = this.createQualifiedDescription(element, description, document);
                     localDescriptions.push(qualified);
                 }
             }
         }
         scopes.addAll(container, localDescriptions);
        //  console.log(localDescriptions)
         return localDescriptions;
     }
 
     protected createQualifiedDescription(pack: ContextModule | ClassElement, description: AstNodeDescription, document: LangiumDocument): AstNodeDescription {
         const name = (this.nameProvider as TontoNameProvider).getQualifiedName(pack.name, description.name);
         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
         return this.descriptions.createDescription(description.node!, name, document);
     }
 
 }
 