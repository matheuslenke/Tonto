import { BindingTarget, DiagramConfiguration, GLSPServer, GModelDiagramModule, InstanceMultiBinding, OperationHandlerConstructor, ServerModule, SourceModelStorage } from "@eclipse-glsp/server";
import { injectable } from "inversify";
import { TontoGLSPServer } from "../common/tonto-glsp-server.js";
import { TontoDiagramAddEntityOperationHandler } from "./handler/add-entity-operation-handler.js";
import { TontoDiagramConfiguration } from "./tonto-diagram-configuration.js";

@injectable()
export class TontoServerModule extends ServerModule {
    protected override bindGLSPServer(): BindingTarget<GLSPServer> {
        return TontoGLSPServer;
    }
}

@injectable()
export class TontoDiagramModule extends GModelDiagramModule {
    constructor(public bindSourceModelStorage: () => BindingTarget<SourceModelStorage>) {
        super();
    }

    get diagramType(): string {
        return "tonto-diagram";
    }

    protected override bindDiagramConfiguration(): BindingTarget<DiagramConfiguration> {
        return TontoDiagramConfiguration;
    }

    // protected override bindSourceModelStorage(): BindingTarget<SourceModelStorage> {
    //     return TontoStorage;
    // }

    protected override configureOperationHandlers(binding: InstanceMultiBinding<OperationHandlerConstructor>): void {
        super.configureOperationHandlers(binding);
        // binding.add(SystemDiagramChangeBoundsOperationHandler); // move + resize behavior
        // binding.add(SystemDiagramCreateEdgeOperationHandler); // create 1:1 relationship
        // binding.add(SystemDiagramDeleteOperationHandler); // delete elements
        // binding.add(SystemDiagramDropEntityOperationHandler);
        binding.add(TontoDiagramAddEntityOperationHandler);
    }


    // protected override configureContextActionProviders(binding: MultiBinding<ContextActionsProvider>): void {
    //     super.configureContextActionProviders(binding);
    //     binding.add(TontoDiagramAddEntityActionProvider);
    // }

    // protected override bindGModelIndex(): BindingTarget<GModelIndex> {
    //     bindAsService(this.context, TontoIndex, TontoModelIndex);
    //     return { service: TontoModelIndex };
    // }

    // protected bindModelState(): BindingTarget<ModelState> {
    //     bindAsService(this.context, TontoModelState, TontoModelState);
    //     return { service: TontoModelState };
    // }

    // protected bindGModelFactory(): BindingTarget<GModelFactory> {
    //     return TontoDiagramGModelFactory;
    // }

    // protected override bindModelSubmissionHandler(): BindingTarget<ModelSubmissionHandler> {
    //     return ModelSubmissionHandler;
    // }
}