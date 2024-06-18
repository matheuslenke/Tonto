
import { DiagramConfiguration, ServerLayoutKind, getDefaultMapping } from "@eclipse-glsp/server";
import { injectable } from "inversify";
import { ENTITY_NODE_TYPE, RELATIONSHIP_EDGE_TYPE } from "../../protocol/glsp/types.js";

@injectable()
export class TontoDiagramConfiguration implements DiagramConfiguration {
    layoutKind = ServerLayoutKind.MANUAL; // we store layout information manually so no automatic layouting is necessary
    needsClientLayout = true; // require layout information from client
    animatedUpdate = true; // use animations during state updates

    typeMapping = getDefaultMapping();

    shapeTypeHints = [
        {
            elementTypeId: ENTITY_NODE_TYPE,
            deletable: true,
            reparentable: false,
            repositionable: true,
            resizable: true
        }
    ];
    edgeTypeHints = [
        {
            elementTypeId: RELATIONSHIP_EDGE_TYPE,
            deletable: true,
            repositionable: false,
            routable: false,
            sourceElementTypeIds: [ENTITY_NODE_TYPE],
            targetElementTypeIds: [ENTITY_NODE_TYPE]
        }
    ];
}