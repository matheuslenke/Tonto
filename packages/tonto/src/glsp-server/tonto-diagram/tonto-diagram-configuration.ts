
import { DefaultTypes, DiagramConfiguration, EdgeTypeHint, GModelElement, GModelElementConstructor, ServerLayoutKind, ShapeTypeHint, getDefaultMapping } from "@eclipse-glsp/server";
import { injectable } from "inversify";

@injectable()
export class TontoDiagramConfiguration implements DiagramConfiguration {
    layoutKind = ServerLayoutKind.MANUAL; // we store layout information manually so no automatic layouting is necessary
    needsClientLayout = true; // require layout information from client
    animatedUpdate = true; // use animations during state updates

    get typeMapping(): Map<string, GModelElementConstructor<GModelElement>> {
        return getDefaultMapping();
    }

    get shapeTypeHints(): ShapeTypeHint[] {
        return [
            {
                elementTypeId: DefaultTypes.NODE,
                deletable: true,
                reparentable: false,
                repositionable: true,
                resizable: true
            }
        ];
    }

    get edgeTypeHints(): EdgeTypeHint[] {
        return [
            {
                elementTypeId: DefaultTypes.EDGE,
                deletable: true,
                repositionable: false,
                routable: false,
                sourceElementTypeIds: [DefaultTypes.NODE],
                targetElementTypeIds: [DefaultTypes.NODE]
            }
        ];
    }
}