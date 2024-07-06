import { Operation, Point, hasObjectProp, hasStringProp } from "@eclipse-glsp/server";

export interface AddEntityOperation extends Operation {
    kind: typeof AddEntityOperation.KIND;

    /** Insert position for dropped entities. */
    position: Point;
    /** Name of the entity to be added. */
    entityName: string;
}

export namespace AddEntityOperation {
    export const KIND = "addEntityOperation";

    export function is(object: unknown): object is AddEntityOperation {
        return Operation.hasKind(object, KIND) && hasStringProp(object, "entityName") && hasObjectProp(object, "position");
    }

    export function create(entityName: string, position: Point): AddEntityOperation {
        return {
            kind: KIND,
            isOperation: true,
            entityName,
            position
        };
    }
}