import { Command, JsonOperationHandler, MaybePromise, ModelState } from "@eclipse-glsp/server";
import { inject, injectable } from "inversify";
import { ClassDeclaration, NodeView } from "../../../language/index.js";
import { TontoCommand } from "../../common/tonto-command.js";
import { AddEntityOperation } from "../command-palette/actions.js";
import { TontoModelState } from "../model/tonto-model-state.js";

@injectable()
export class TontoDiagramAddEntityOperationHandler extends JsonOperationHandler {
    override operationType = AddEntityOperation.KIND;
    @inject(ModelState) protected override modelState!: TontoModelState;

    override createCommand(operation: AddEntityOperation): MaybePromise<Command | undefined> {
        return new TontoCommand(this.modelState, () => this.createEntityNode(operation));
    }

    protected async createEntityNode(operation: AddEntityOperation): Promise<void> {
        const scope = this.modelState.services.language.references.ScopeProvider.getCompletionScope({
            container: { globalId: this.modelState.tontoDiagram.id! },
            syntheticElements: [{ property: "nodes", type: NodeView }],
            property: "entity"
        });

        const container = this.modelState.tontoDiagram;
        const entityDescription = scope.elementScope.getElement(operation.entityName);

        if (entityDescription) {
            const node: NodeView = {
                $type: NodeView,
                $container: container,
                id: this.modelState.idProvider.findNextId(NodeView, entityDescription.name + "Node", container),
                entity: {
                    $refText: entityDescription.name,
                    ref: entityDescription.node as ClassDeclaration | undefined
                },
                x: operation.position.x,
                y: operation.position.y,
                width: 10,
                height: 10
            };
            container.nodes.push(node);
        }
    }
}