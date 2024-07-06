import { inject, injectable } from "inversify";
import { TontoDiagramView } from "../../../language/index.js";
import { TontoState } from "../../common/tonto-model-state.js";
import { TontoModelIndex } from "./tonto-model-index.js";

@injectable()
export class TontoModelState extends TontoState {
    @inject(TontoModelIndex) override readonly index!: TontoModelIndex;

    get tontoDiagram(): TontoDiagramView {
        return this.semanticRoot.diagram!;
    }
}