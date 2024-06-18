import { ClientSession, ClientSessionListener, GLSPServerError, MaybePromise, RequestModelAction, SOURCE_URI_ARG, SaveModelAction, SourceModelStorage } from "@eclipse-glsp/server";
import { inject, injectable } from "inversify";
import { URI } from "vscode-uri";
import { Model, isModel } from "../../language/generated/ast.js";
import { TontoState } from "./tonto-model-state.js";

@injectable()
export class TontoStorage implements SourceModelStorage, ClientSessionListener {
    @inject(TontoState) protected state!: TontoState;

    async loadSourceModel(action: RequestModelAction): Promise<void> {
        const sourceUri = this.getSourceUri(action);
        const rootUri = URI.file(sourceUri).toString();
        const root = await this.update(rootUri);
    }

    protected async update(uri: string, root?: Model): Promise<Model | undefined> {
        const newRoot = root ?? (await this.state.modelService.request(uri, isModel));
        if (newRoot) {
            this.state.setSemanticRoot(uri, newRoot);
        } else {
            // this.logger.error("Could not find model for " + uri);
        }
        return newRoot;
    }

    saveSourceModel(action: SaveModelAction): MaybePromise<void> {
        throw new Error("Method not implemented.");
    }
    sessionCreated?(clientSession: ClientSession): void {
        throw new Error("Method not implemented.");
    }
    sessionDisposed?(clientSession: ClientSession): void {
        throw new Error("Method not implemented.");
    }

    protected getSourceUri(action: RequestModelAction): string {
        const sourceUri = action.options?.[SOURCE_URI_ARG];
        if (typeof sourceUri !== "string") {
            throw new GLSPServerError(`Invalid RequestModelAction! Missing argument with key '${SOURCE_URI_ARG}'`);
        }
        return sourceUri;
    }
}