import { GGraph, GModelFactory, GNode, ModelState } from "@eclipse-glsp/server";
import { inject, injectable } from "inversify";
import { NodeView } from "../../../language/index.js";
import { GEntityNode } from "./nodes.js";
import { TontoModelState } from "./tonto-model-state.js";

@injectable()
export class TontoDiagramGModelFactory implements GModelFactory {
    @inject(ModelState) protected readonly tontoState!: TontoModelState;

    createModel(): void {
        const newRoot = this.createGraph();
        if (newRoot) {
            this.tontoState.updateRoot(newRoot);
        }
    }

    protected createGraph(): GGraph | undefined {
        const diagramRoot = this.tontoState.tontoDiagram;
        if (!diagramRoot) {
            return;
        }
        const graphBuilder = GGraph.builder().id(this.tontoState.semanticUri);

        diagramRoot.nodes.map(node => this.createEntityNode(node)).forEach(entity => graphBuilder.add(entity));

        return graphBuilder.build();
    }

    protected createEntityNode(node: NodeView): GNode {
        return GEntityNode.builder().set(node, this.tontoState.index).build();
    }
}