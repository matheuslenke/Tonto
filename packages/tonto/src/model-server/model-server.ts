/* eslint-disable @typescript-eslint/no-explicit-any */

import { AstNode, isReference } from "langium";
import { Disposable } from "vscode-jsonrpc";
import * as rpc from "vscode-jsonrpc/node.js";
import { findRootNode, getDocument } from "../utils/ast-util.js";
import { ModelService } from "./model-service.js";
import { CloseModel, CloseModelArgs, CrossReference, CrossReferenceContext, FindReferenceableElements, isTontoRoot, OnModelSaved, OnModelUpdated, OnSystemsUpdated, OpenModel, OpenModelArgs, ReferenceableElement, RequestModel, RequestSystemInfo, RequestSystemInfos, ResolvedElement, ResolveReference, SaveModel, SaveModelArgs, SystemInfo, SystemInfoArgs, TontoRoot, UpdateModel, UpdateModelArgs } from "./types.js";

export class ModelServer {
    protected toDispose: Disposable[] = [];
    protected toDisposeForSession: Map<string, Disposable[]> = new Map();

    constructor(
        protected connection: rpc.MessageConnection,
        protected modelService: ModelService
    ) {
        this.initialize(connection);
    }

    protected initialize(connection: rpc.MessageConnection): void {
        this.toDispose.push(connection.onRequest(OpenModel, args => this.openModel(args)));
        this.toDispose.push(connection.onRequest(CloseModel, args => this.closeModel(args)));
        this.toDispose.push(connection.onRequest(RequestModel, uri => this.requestModel(uri)));
        this.toDispose.push(connection.onRequest(FindReferenceableElements, args => this.complete(args)));
        this.toDispose.push(connection.onRequest(ResolveReference, args => this.resolve(args)));
        this.toDispose.push(connection.onRequest(UpdateModel, args => this.updateModel(args)));
        this.toDispose.push(connection.onRequest(SaveModel, args => this.saveModel(args)));
        this.toDispose.push(connection.onRequest(RequestSystemInfo, args => this.systemInfo(args)));
        this.toDispose.push(connection.onRequest(RequestSystemInfos, args => this.systemInfos()));
        this.toDispose.push(this.modelService.onSystemUpdated(event => this.connection.sendNotification(OnSystemsUpdated, event)));
    }

    protected systemInfo(args: SystemInfoArgs): Promise<SystemInfo | undefined> {
        return this.modelService.getSystemInfo(args);
    }

    protected systemInfos(): Promise<SystemInfo[]> {
        return this.modelService.getSystemInfos();
    }

    protected complete(args: CrossReferenceContext): Promise<ReferenceableElement[]> {
        return this.modelService.findReferenceableElements(args);
    }

    protected async resolve(args: CrossReference): Promise<ResolvedElement | undefined> {
        const node = await this.modelService.resolveCrossReference(args);
        if (!node) {
            return undefined;
        }
        const uri = getDocument(node).uri.toString();
        const model = this.toSerializable(findRootNode(node)) as TontoRoot;
        return { uri, model };
    }

    protected async openModel(args: OpenModelArgs): Promise<TontoRoot | undefined> {
        if (!this.modelService.isOpen(args.uri)) {
            await this.modelService.open(args);
        }
        this.setupListeners(args);
        return this.requestModel(args.uri);
    }

    protected setupListeners(args: OpenModelArgs): void {
        this.disposeListeners(args);
        const listenersForClient: Disposable[] = [];
        listenersForClient.push(
            this.modelService.onModelSaved(args.uri, event =>
                this.connection.sendNotification(OnModelSaved, {
                    uri: args.uri,
                    model: this.toSerializable(event.model) as TontoRoot,
                    sourceClientId: event.sourceClientId
                })
            ),
            this.modelService.onModelUpdated(args.uri, event =>
                this.connection.sendNotification(OnModelUpdated, {
                    uri: args.uri,
                    model: this.toSerializable(event.model) as TontoRoot,
                    sourceClientId: event.sourceClientId,
                    reason: event.reason
                })
            )
        );
        this.toDisposeForSession.set(args.clientId, listenersForClient);
    }
    protected disposeListeners(args: CloseModelArgs): void {
        this.toDisposeForSession.get(args.clientId)?.forEach(disposable => disposable.dispose());
        this.toDisposeForSession.delete(args.clientId);
    }

    protected async closeModel(args: CloseModelArgs): Promise<void> {
        this.disposeListeners(args);
        return this.modelService.close(args);
    }

    protected async requestModel(uri: string): Promise<TontoRoot | undefined> {
        const root = await this.modelService.request(uri, isTontoRoot);
        return this.toSerializable(root) as TontoRoot;
    }

    protected async updateModel(args: UpdateModelArgs<TontoRoot>): Promise<TontoRoot> {
        const updated = await this.modelService.update(args);
        return this.toSerializable(updated) as TontoRoot;
    }

    protected async saveModel(args: SaveModelArgs<TontoRoot>): Promise<void> {
        await this.modelService.save(args);
    }

    dispose(): void {
        this.toDispose.forEach(disposable => disposable.dispose());
    }

    /**
    * Cleans the semantic object of any property that cannot be serialized as a String and thus cannot be sent to the client
    * over the RPC connection.
    *
    * @param obj semantic object
    * @returns serializable semantic object
    */
    protected toSerializable<T extends AstNode, O extends object>(obj?: T): O | undefined {
        if (!obj) {
            return;
        }
        // We remove all $<property> from the semantic object with the exception of type
        // they are added by Langium but have no additional value on the client side
        // Furthermore we ensure that for references we use their string representation ($refText)
        // instead of their real value to avoid sending whole serialized object graphs
        return <O>Object.entries(obj)
            .filter(([key, value]) => !key.startsWith("$") || key === "$type" || key === "$id")
            .reduce((acc, [key, value]) => ({ ...acc, [key]: this.cleanValue(value) }), { $globalId: this.modelService.getGlobalId(obj) });
    }

    protected cleanValue(value: any): any {
        if (Array.isArray(value)) {
            return value.map(val => this.cleanValue(val));
        } else if (this.isContainedObject(value)) {
            return this.toSerializable(value);
        } else {
            return this.resolvedValue(value);
        }
    }
    protected isContainedObject(value: any): boolean {
        return value === Object(value) && !isReference(value);
    }

    protected resolvedValue(value: any): any {
        if (isReference(value)) {
            return value.$refText;
        }
        return value;
    }
}