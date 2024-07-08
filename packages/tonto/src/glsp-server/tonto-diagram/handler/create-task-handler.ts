import { GhostElement, Point } from "@eclipse-glsp/protocol";
import { CreateNodeOperation, GNode } from "@eclipse-glsp/server";
import { injectable } from "inversify";
import { TaskNode, TaskNodeBuilder } from "../../common/graph-extension.js";
import { ModelTypes } from "../../common/util/model-types.js";
import { CreateTontoNodeOperationHandler } from "./create-tonto-node-handler.js";
@injectable()
export abstract class CreateTaskHandler extends CreateTontoNodeOperationHandler {
    createNode(operation: CreateNodeOperation, relativeLocation?: Point): GNode | undefined {
        return this.builder(relativeLocation).build();
    }

    protected builder(point: Point = Point.ORIGIN, elementTypeId = this.elementTypeIds[0]): TaskNodeBuilder {
        return TaskNode.builder()
            .position(point ?? Point.ORIGIN)
            .name(this.label.replace(" ", "") + this.modelState.index.getAllByClass(TaskNode).length)
            .type(elementTypeId)
            .taskType(ModelTypes.toNodeType(elementTypeId))
            .children();
    }

    override createTriggerGhostElement(elementTypeId: string): GhostElement | undefined {
        return { template: this.serializer.createSchema(this.builder(undefined, elementTypeId).build()), dynamic: true };
    }
}
