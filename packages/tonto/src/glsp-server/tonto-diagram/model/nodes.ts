import { ArgsUtil, GNode, GNodeBuilder } from "@eclipse-glsp/server";
import { NodeView } from "../../../language/index.js";
import { createHeader } from "../../common/nodes.js";
import { ENTITY_NODE_TYPE } from "../../protocol/glsp/types.js";
import { TontoModelIndex } from "./tonto-model-index.js";

export class GEntityNode extends GNode {
    override type = ENTITY_NODE_TYPE;

    static override builder(): GEntityNodeBuilder {
        return new GEntityNodeBuilder(GEntityNode).type(ENTITY_NODE_TYPE);
    }
}

export class GEntityNodeBuilder extends GNodeBuilder<GEntityNode> {
    set(node: NodeView, index: TontoModelIndex): this {
        this.id(index.createId(node));

        const entityRef = node.entity.ref;

        this.add(createHeader(entityRef?.id || entityRef?.id || "unresolved", this.proxy.id));

        this.layout("vbox")
            .addArgs(ArgsUtil.cornerRadius(3))
            .addLayoutOption("prefWidth", node.width || 100)
            .addLayoutOption("prefHeight", node.height || 100)
            .position(node.x || 100, node.y || 100);
        return this;
    }
}