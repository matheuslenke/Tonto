import {
    bindOrRebind,
    configureDefaultModelElements,
    configureModelElement,
    ConsoleLogger,
    ContainerConfiguration,
    editLabelFeature,
    FeatureModule,
    GLabel,
    GLabelView,
    GNode,
    gridModule,
    initializeDiagramContainer,
    LogLevel,
    RoundedCornerNodeView,
    TYPES
} from "@eclipse-glsp/client";
import "balloon-css/balloon.min.css";
import { Container } from "inversify";
import "../css/diagram.css";
import { TontoSnapper } from "./tonto-snapper.js";

export const TontoDiagramModule = new FeatureModule(
    (bind, unbind, isBound, rebind) => {
        const context = { bind, unbind, isBound, rebind };

        bindOrRebind(context, TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
        bindOrRebind(context, TYPES.LogLevel).toConstantValue(LogLevel.warn);

        configureDefaultModelElements(context);
        configureModelElement(context, "task:automated", GNode, RoundedCornerNodeView);
        configureModelElement(context, "label:heading", GLabel, GLabelView, { enable: [editLabelFeature] });
        // configureModelElement(context, "comp:comp", GCompartment, GCompartmentView);
        // configureModelElement(context, "label:icon", GLabel, GLabelView);
        // overrideModelElement(context, DefaultTypes.EDGE, GEdge, WorkflowEdgeView);
        // configureModelElement(context, "edge:weighted", WeightedEdge, WorkflowEdgeView);
        // configureModelElement(context, "icon", Icon, IconView);
        // configureModelElement(context, "activityNode:merge", BranchingNode, DiamondNodeView);
        // configureModelElement(context, "activityNode:decision", BranchingNode, DiamondNodeView);
        // configureModelElement(context, "activityNode:fork", SynchronizationNode, RectangularNodeView);
        // configureModelElement(context, "activityNode:join", SynchronizationNode, RectangularNodeView);
        // overrideModelElement(context, DefaultTypes.GRAPH, GGraph, GLSPProjectionView);
        // configureModelElement(context, "category", CategoryNode, RoundedCornerNodeView);
        // configureModelElement(context, "struct", GCompartment, StructureCompartmentView);

        // bind<IHelperLineOptions>(TYPES.IHelperLineOptions).toDynamicValue(ctx => {
        //     const options: IHelperLineOptions = {};
        //     // skip icons for alignment as well as compartments which are only used for structure
        //     options.alignmentElementFilter = element =>
        //         DEFAULT_ALIGNABLE_ELEMENT_FILTER(element) && !(element instanceof Icon) && !(element instanceof GCompartment);
        //     return options;
        // });

        // bindAsService(context, TYPES.IDiagramStartup, TontoStartup);
        bindOrRebind(context, TYPES.ISnapper).to(TontoSnapper);
    },
    { featureId: Symbol("workflowDiagram") }
);
export function createTontoDiagramContainer(...containerConfiguration: ContainerConfiguration): Container {
    return initializeTontoDiagramContainer(new Container(), ...containerConfiguration);
}

export function initializeTontoDiagramContainer(container: Container, ...containerConfiguration: ContainerConfiguration): Container {
    return initializeDiagramContainer(
        container,
        gridModule,
        TontoDiagramModule,
        ...containerConfiguration);
}