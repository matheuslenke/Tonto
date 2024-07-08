
import { DefaultTypes, DiagramConfiguration, EdgeTypeHint, GCompartment, GEdge, GLabel, GModelElementConstructor, ServerLayoutKind, ShapeTypeHint, getDefaultMapping } from "@eclipse-glsp/server";
import { injectable } from "inversify";
import { ActivityNode, TaskNode } from "../common/graph-extension.js";
import { ModelTypes as types } from "../common/util/model-types.js";
@injectable()
export class TontoDiagramConfiguration implements DiagramConfiguration {
    layoutKind = ServerLayoutKind.MANUAL; // we store layout information manually so no automatic layouting is necessary
    needsClientLayout = true; // require layout information from client
    animatedUpdate = true; // use animations during state updates

    get typeMapping(): Map<string, GModelElementConstructor> {
        const mapping = getDefaultMapping();
        mapping.set(types.LABEL_HEADING, GLabel);
        mapping.set(types.LABEL_TEXT, GLabel);
        mapping.set(types.COMP_HEADER, GCompartment);
        mapping.set(types.LABEL_ICON, GLabel);
        mapping.set(types.WEIGHTED_EDGE, GEdge);
        mapping.set(types.ICON, GCompartment);
        mapping.set(types.ACTIVITY_NODE, ActivityNode);
        mapping.set(types.ENTITY_NODE, TaskNode);
        return mapping;
    }

    get shapeTypeHints(): ShapeTypeHint[] {
        return [
            createDefaultShapeTypeHint(types.ENTITY_NODE),
            createDefaultShapeTypeHint({ elementTypeId: types.FORK_NODE, resizable: false }),
            createDefaultShapeTypeHint({ elementTypeId: types.JOIN_NODE, resizable: false }),
            createDefaultShapeTypeHint(types.DECISION_NODE),
            createDefaultShapeTypeHint(types.MERGE_NODE)
        ];
    }

    get edgeTypeHints(): EdgeTypeHint[] {
        return [
            createDefaultEdgeTypeHint(DefaultTypes.EDGE),
            createDefaultEdgeTypeHint({
                elementTypeId: DefaultTypes.EDGE,
                dynamic: true,
                sourceElementTypeIds: [types.ACTIVITY_NODE],
                targetElementTypeIds: [types.ENTITY_NODE, types.ACTIVITY_NODE]
            })
        ];
    }
}

export function createDefaultShapeTypeHint(template: { elementTypeId: string } & Partial<ShapeTypeHint>): ShapeTypeHint;
export function createDefaultShapeTypeHint(elementId: string): ShapeTypeHint;
export function createDefaultShapeTypeHint(
    elementIdOrTemplate: string | ({ elementTypeId: string } & Partial<ShapeTypeHint>)
): ShapeTypeHint {
    const template = typeof elementIdOrTemplate === "string" ? { elementTypeId: elementIdOrTemplate } : elementIdOrTemplate;
    return { repositionable: true, deletable: true, resizable: true, reparentable: true, ...template };
}

export function createDefaultEdgeTypeHint(template: { elementTypeId: string } & Partial<EdgeTypeHint>): EdgeTypeHint;
export function createDefaultEdgeTypeHint(elementId: string): EdgeTypeHint;
export function createDefaultEdgeTypeHint(elementIdOrTemplate: string | ({ elementTypeId: string } & Partial<EdgeTypeHint>)): EdgeTypeHint {
    const template = typeof elementIdOrTemplate === "string" ? { elementTypeId: elementIdOrTemplate } : elementIdOrTemplate;
    return {
        repositionable: true,
        deletable: true,
        routable: true,
        sourceElementTypeIds: [
            types.ENTITY_NODE,
            types.DECISION_NODE,
            types.MERGE_NODE,
            types.FORK_NODE,
            types.JOIN_NODE,
        ],
        targetElementTypeIds: [
            types.ENTITY_NODE,
            types.DECISION_NODE,
            types.MERGE_NODE,
            types.FORK_NODE,
            types.JOIN_NODE,
        ],
        ...template
    };
}
