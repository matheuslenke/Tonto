import { BindingTarget, ContextActionsProvider, DiagramConfiguration, DiagramModule, GLSPServer, GModelFactory, GModelIndex, InstanceMultiBinding, ModelState, ModelSubmissionHandler, MultiBinding, OperationHandlerConstructor, ServerModule, SourceModelStorage, bindAsService } from "@eclipse-glsp/server";
import { injectable } from "inversify";
import { TontoGLSPServer } from "../common/tonto-glsp-server.js";
import { TontoIndex } from "../common/tonto-index.js";
import { TontoStorage } from "../common/tonto-model-storage.js";
import { TontoDiagramAddEntityActionProvider } from "./command-palette/add-entity-action-provider.js";
import { TontoDiagramAddEntityOperationHandler } from "./handler/add-entity-operation-handler.js";
import { TontoDiagramGModelFactory } from "./model/tonto-diagram-gmodel-factory.js";
import { TontoModelIndex } from "./model/tonto-model-index.js";
import { TontoModelState } from "./model/tonto-model-state.js";
import { TontoDiagramConfiguration } from "./tonto-diagram-configuration.js";

@injectable()
export class TontoServerModule extends ServerModule {
    protected override bindGLSPServer(): BindingTarget<GLSPServer> {
        return TontoGLSPServer;
    }
}

@injectable()
export class TontoDiagramModule extends DiagramModule {
    readonly diagramType = "tonto-diagram";

    protected override bindDiagramConfiguration(): BindingTarget<DiagramConfiguration> {
        return TontoDiagramConfiguration;
    }

    protected override bindSourceModelStorage(): BindingTarget<SourceModelStorage> {
        return TontoStorage;
    }

    protected override configureOperationHandlers(binding: InstanceMultiBinding<OperationHandlerConstructor>): void {
        super.configureOperationHandlers(binding);
        // binding.add(SystemDiagramChangeBoundsOperationHandler); // move + resize behavior
        // binding.add(SystemDiagramCreateEdgeOperationHandler); // create 1:1 relationship
        // binding.add(SystemDiagramDeleteOperationHandler); // delete elements
        // binding.add(SystemDiagramDropEntityOperationHandler);
        binding.add(TontoDiagramAddEntityOperationHandler);

    }

    protected override configureContextActionProviders(binding: MultiBinding<ContextActionsProvider>): void {
        super.configureContextActionProviders(binding);
        binding.add(TontoDiagramAddEntityActionProvider);
    }

    protected override bindGModelIndex(): BindingTarget<GModelIndex> {
        bindAsService(this.context, TontoIndex, TontoModelIndex);
        return { service: TontoModelIndex };
    }

    protected bindModelState(): BindingTarget<ModelState> {
        bindAsService(this.context, TontoModelState, TontoModelState);
        return { service: TontoModelState };
    }

    protected bindGModelFactory(): BindingTarget<GModelFactory> {
        return TontoDiagramGModelFactory;
    }

    protected override bindModelSubmissionHandler(): BindingTarget<ModelSubmissionHandler> {
        return ModelSubmissionHandler;
    }
}