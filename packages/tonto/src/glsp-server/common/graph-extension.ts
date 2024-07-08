import {
    ArgsUtil,
    GCompartment,
    GEdge,
    GEdgeBuilder,
    GLabel,
    GLabelBuilder,
    GNode,
    GNodeBuilder
} from "@eclipse-glsp/server";
import { ModelTypes } from "./util/model-types.js";

export class ActivityNode extends GNode {
    nodeType!: string;

    static override builder(): ActivityNodeBuilder {
        return new ActivityNodeBuilder(ActivityNode);
    }
}

export class ActivityNodeBuilder<T extends ActivityNode = ActivityNode> extends GNodeBuilder<T> {
    nodeType(nodeType: string): this {
        this.proxy.nodeType = nodeType;
        return this;
    }
}

export class TaskNode extends GNode {
    name!: string;
    duration!: number;
    taskType!: string;
    references!: string;

    static override builder(): TaskNodeBuilder {
        return new TaskNodeBuilder(TaskNode).layout("vbox").addArgs(ArgsUtil.cornerRadius(5)).addCssClass("task");
    }
}

export class TaskNodeBuilder<T extends TaskNode = TaskNode> extends GNodeBuilder<T> {
    name(name: string): this {
        this.proxy.name = name;
        return this;
    }

    duration(duration: number): this {
        this.proxy.duration = duration;
        return this;
    }

    taskType(tasktype: string): this {
        this.proxy.taskType = tasktype;
        return this;
    }

    references(references: string): this {
        this.proxy.references = references;
        return this;
    }

    children(): this {
        return this;
    }

    override build(): T {
        this.layout("hbox").addLayoutOption("paddingRight", 10).add(this.createCompartmentIcon()).add(this.createCompartmentHeader());
        return super.build();
    }

    protected createCompartmentHeader(): GLabel {
        return new GLabelBuilder(GLabel)
            .type(ModelTypes.LABEL_HEADING)
            .id(this.proxy.id + "_classname")
            .text(this.proxy.name)
            .build();
    }

    protected createCompartmentIcon(): GCompartment {
        return GCompartment.builder()
            .id(this.proxy.id + "_icon")
            .type(ModelTypes.ICON)
            .build();
    }
}

export class WeightedEdge extends GEdge {
    probability?: string;

    static override builder(): WeightedEdgeBuilder {
        return new WeightedEdgeBuilder(WeightedEdge).type(ModelTypes.WEIGHTED_EDGE);
    }
}

export class WeightedEdgeBuilder<E extends WeightedEdge = WeightedEdge> extends GEdgeBuilder<E> {
    probability(probability: string): this {
        this.proxy.probability = probability;
        return this;
    }
}