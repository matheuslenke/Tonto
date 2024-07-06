/********************************************************************************
 * Copyright (c) 2023 CrossBreeze.
 ********************************************************************************/
import { JsonRecordingCommand, MaybePromise } from "@eclipse-glsp/server";
import * as jsonPatch from "fast-json-patch";
import { TontoSourceModel, TontoState } from "./tonto-model-state.js";

/**
 * A custom recording command that tracks updates during execution through a textual semantic state.
 * Tracking updates ensures that we have proper undo/redo support
 */
export class TontoCommand extends JsonRecordingCommand<TontoSourceModel> {
    constructor(
        protected state: TontoState,
        protected runnable: () => MaybePromise<void>
    ) {
        super(state, runnable);
    }

    protected override postChange(newModel: TontoSourceModel): MaybePromise<void> {
        return this.state.updateSourceModel(newModel);
    }

    override async execute(): Promise<void> {
        const beforeState = this.deepClone(await this.getJsonObject());
        await this.doExecute();
        const afterState = await this.getJsonObject();
        this.undoPatch = jsonPatch.compare(afterState, beforeState);
        this.redoPatch = jsonPatch.compare(beforeState, afterState);
        await this.postChange?.(afterState);
    }

    override async undo(): Promise<void> {
        if (this.undoPatch) {
            const result = this.applyPatch(await this.getJsonObject(), this.undoPatch);
            await this.postChange?.(result.newDocument);
        }
    }

    override async redo(): Promise<void> {
        if (this.redoPatch) {
            const result = this.applyPatch(await this.getJsonObject(), this.redoPatch);
            await this.postChange?.(result.newDocument);
        }
    }
}
