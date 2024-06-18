import { BindingTarget, DiagramConfiguration, DiagramModule, GModelFactory, ModelState, SourceModelStorage } from "@eclipse-glsp/server";
import { injectable } from "inversify";
import { TontoStorage } from "../common/tonto-model-storage.js";
import { TontoDiagramConfiguration } from "./tonto-diagram-configuration.js";

@injectable()
export class TontoDiagramModule extends DiagramModule {
    readonly diagramType = "tonto-diagram";

    protected override bindDiagramConfiguration(): BindingTarget<DiagramConfiguration> {
        return TontoDiagramConfiguration;
    }

    protected override bindSourceModelStorage(): BindingTarget<SourceModelStorage> {
        return TontoStorage;
    }

    protected override bindModelState(): BindingTarget<ModelState> {
        throw new Error("Method not implemented.");
    }
    protected override bindGModelFactory(): BindingTarget<GModelFactory> {
        throw new Error("Method not implemented.");
    }
}