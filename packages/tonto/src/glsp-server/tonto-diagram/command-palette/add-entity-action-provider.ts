/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContextActionsProvider, EditorContext, LabeledAction, ModelState, Point } from "@eclipse-glsp/server";
import { inject } from "inversify";
import { codiconCSSString } from "sprotty";
import { NodeView } from "../../../language/index.js";
import { TontoModelState } from "../model/tonto-model-state.js";
import { AddEntityOperation } from "./actions.js";

export class TontoDiagramAddEntityActionProvider implements ContextActionsProvider {
    contextId = "command-palette";

    @inject(ModelState) protected state!: TontoModelState;

    async getActions(editorContext: EditorContext): Promise<LabeledAction[]> {
        const completionItems = this.state.services.language.references.ScopeProvider.complete({
            container: { globalId: this.state.tontoDiagram.id! },
            syntheticElements: [{ property: "nodes", type: NodeView }],
            property: "entity"
        });
        return completionItems.map<LabeledAction>((item: any) => ({
            label: item.label,
            actions: [AddEntityOperation.create(item.label, editorContext.lastMousePosition || Point.ORIGIN)],
            icon: codiconCSSString("inspect")
        }));
    }
}