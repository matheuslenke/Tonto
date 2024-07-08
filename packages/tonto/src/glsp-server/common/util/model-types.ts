
/* eslint-disable @typescript-eslint/padding-line-between-statements */
export namespace ModelTypes {
    export const LABEL_HEADING = "label:heading";
    export const LABEL_TEXT = "label:text";
    export const COMP_HEADER = "comp:header";
    export const LABEL_ICON = "label:icon";
    export const WEIGHTED_EDGE = "edge:weighted";
    export const ICON = "icon";
    export const ACTIVITY_NODE = "activityNode";
    export const DECISION_NODE = `${ACTIVITY_NODE}:decision`;
    export const MERGE_NODE = `${ACTIVITY_NODE}:merge`;
    export const FORK_NODE = `${ACTIVITY_NODE}:fork`;
    export const JOIN_NODE = `${ACTIVITY_NODE}:join`;
    export const ENTITY_NODE = "entity";

    export function toNodeType(type: string): string {
        switch (type) {
            case DECISION_NODE:
                return "decisionNode";
            case MERGE_NODE:
                return "mergeNode";
            case FORK_NODE:
                return "forkNode";
            case JOIN_NODE:
                return "joinNode";
            case ENTITY_NODE:
                return "entity";
            default:
                return "unknown";
        }
    }
}
