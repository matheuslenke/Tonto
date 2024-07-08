import { Point } from "@eclipse-glsp/server";
import { injectable } from "inversify";
import { TaskNodeBuilder } from "../../common/graph-extension.js";
import { ModelTypes } from "../../common/util/model-types.js";
import { CreateTaskHandler } from "./create-task-handler.js";

@injectable()
export class CreateAutomatedTaskHandler extends CreateTaskHandler {
    elementTypeIds = [ModelTypes.ENTITY_NODE];
    label = "Tonto Entity";

    protected override builder(point: Point | undefined): TaskNodeBuilder {
        return super.builder(point).addCssClass("automated");
    }
}