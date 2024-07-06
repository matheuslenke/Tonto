import {
    configureDefaultModelElements,
    configureModelElement,
    ConsoleLogger,
    ContainerConfiguration,
    DefaultTypes,
    editLabelFeature,
    GLabel,
    GLabelView,
    gridModule,
    initializeDiagramContainer,
    LogLevel,
    TYPES
} from "@eclipse-glsp/client";
import "balloon-css/balloon.min.css";
import { Container, ContainerModule } from "inversify";
import "../css/diagram.css";

const TontoDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
    const context = { bind, unbind, isBound, rebind };

    configureDefaultModelElements(context);
    configureModelElement(context, DefaultTypes.LABEL, GLabel, GLabelView, { enable: [editLabelFeature] });
});

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