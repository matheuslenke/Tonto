import { DefaultModelState, JsonModelState } from "@eclipse-glsp/server";
import { inject } from "inversify";
import { Model } from "../../language/generated/ast.js";
import { TontoQualifiedNameProvider } from "../../language/references/tonto-name-provider.js";
import { ModelService } from "../../model-server/model-service.js";
import { Serializer } from "../../model-server/serializer.js";

import { TontoLSPServices } from "../../integration.js";
import { TontoIndex } from "./tonto-index.js";

export interface TontoSourceModel {
    text: string;
}

export class TontoState extends DefaultModelState implements JsonModelState<TontoSourceModel> {
    @inject(TontoIndex) override readonly index!: TontoIndex;
    @inject(TontoLSPServices) readonly services!: TontoLSPServices;

    protected _semanticUri!: string;
    protected _semanticRoot!: Model;
    protected _packageId!: string;

    setSemanticRoot(uri: string, semanticRoot: Model): void {
        this._semanticUri = uri;
        this._semanticRoot = semanticRoot;
        this._packageId = semanticRoot.module?.id ?? "unknown";
        this.index.indexSemanticRoot(this.semanticRoot);
    }
    get semanticUri(): string {
        return this._semanticUri;
    }

    get semanticRoot(): Model {
        return this._semanticRoot;
    }

    get packageId(): string {
        return this._packageId;
    }

    get modelService(): ModelService {
        return this.services.shared.model.ModelService;
    }

    get semanticSerializer(): Serializer<Model> {
        return this.services.language.serializer.Serializer;
    }

    get idProvider(): TontoQualifiedNameProvider {
        return this.services.language.references.QualifiedNameProvider;
    }

    get sourceModel(): TontoSourceModel {
        return { text: this.semanticText() };
    }

    async updateSourceModel(sourceModel: TontoSourceModel): Promise<void> {
        this._semanticRoot = await this.modelService.update<Model>({
            uri: this.semanticUri,
            model: sourceModel.text ?? this.semanticRoot,
            clientId: this.clientId
        });
        this.index.indexSemanticRoot(this.semanticRoot);
    }

    /** Textual representation of the current semantic root. */
    semanticText(): string {
        return this.services.language.serializer.Serializer.serialize(this.semanticRoot);
    }
}

// export namespace TontoState {
//     export function is(modelState: ModelState): modelState is TontoState {
//         return JsonModelState.is(modelState) && hasFunctionProp(modelState, "setSemanticRoot");
//     }
// }