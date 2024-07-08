import {
    CreateNodeOperation,
    GModelCreateNodeOperationHandler,
    GModelElement,
    ModelState,
    Point
} from "@eclipse-glsp/server";
import { inject, injectable } from "inversify";
import { GridSnapper } from "./grid-snapper.js";

@injectable()
export abstract class CreateTontoNodeOperationHandler extends GModelCreateNodeOperationHandler {
    @inject(ModelState)
    protected override modelState!: ModelState;

    override getLocation(operation: CreateNodeOperation): Point | undefined {
        return GridSnapper.snap(operation.location);
    }

    override getContainer(operation: CreateNodeOperation): GModelElement | undefined {
        const container = super.getContainer(operation);

        return container;
    }
}
