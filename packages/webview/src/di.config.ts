/********************************************************************************
 * Copyright (c) 2020 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import "sprotty/css/sprotty.css";
import "../css/diagram.css";

import { Container, ContainerModule } from "inversify";
import {
    ConsoleLogger, CreateElementCommand, HtmlRootImpl,
    HtmlRootView,
    LogLevel, ManhattanEdgeRouter,
    PolylineEdgeViewWithGapsOnIntersections,
    PreRenderedElementImpl,
    PreRenderedView,
    SCompartmentImpl,
    SCompartmentView,
    SGraphImpl,
    SGraphView,
    SLabelImpl,
    SLabelView, SModelRootImpl,
    SRoutingHandleImpl, SRoutingHandleView, TYPES,
    configureCommand, configureModelElement,
    edgeIntersectionModule,
    editLabelFeature,
    labelEditUiModule,
    layoutableChildFeature,
    loadDefaultModules,
    moveFeature,
    overrideViewerOptions,
    selectFeature
} from "sprotty";
import { CustomRouter } from "./custom-edge-router";
import { ClassLabel, PackageNode, PropertyLabel, TontoEdge, TontoEdgeLabel, TontoNode } from "./model";
import { NodeView, PolylineArrowEdgeView } from "./views";

const tontoDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
    rebind(ManhattanEdgeRouter).to(CustomRouter).inSingletonScope();

    const context = { bind, unbind, isBound, rebind };
    configureModelElement(context, "graph", SGraphImpl, SGraphView);
    configureModelElement(context, "node:class", TontoNode, NodeView);
    configureModelElement(context, "node:package", PackageNode, NodeView, {
        enable: [layoutableChildFeature]
    });
    configureModelElement(context, "node:external", SCompartmentImpl, NodeView);

    configureModelElement(context, "label", SLabelImpl, SLabelView, {
        enable: [editLabelFeature]
    });
    configureModelElement(context, "edge", TontoEdge, PolylineEdgeViewWithGapsOnIntersections);
    configureModelElement(context, "edge:specialization", TontoEdge, PolylineArrowEdgeView);
    configureModelElement(context, "edge:label", TontoEdgeLabel, SLabelView);
    configureModelElement(context, "html", HtmlRootImpl, HtmlRootView);
    configureModelElement(context, "label:heading", ClassLabel, SLabelView, {
        enable: [editLabelFeature]
    });
    configureModelElement(context, "label:text", PropertyLabel, SLabelView, {
        enable: [moveFeature, selectFeature]
    });
    configureModelElement(context, "comp:comp", SCompartmentImpl, SCompartmentView);
    configureModelElement(context, "comp:header", SCompartmentImpl, SCompartmentView);
    configureModelElement(context, "comp:pkgcontent", SCompartmentImpl, SCompartmentView);
    configureModelElement(context, "pre-rendered", PreRenderedElementImpl, PreRenderedView);
    configureModelElement(context, "palette", SModelRootImpl, HtmlRootView);
    configureModelElement(context, "routing-point", SRoutingHandleImpl, SRoutingHandleView);
    configureModelElement(context, "volatile-routing-point", SRoutingHandleImpl, SRoutingHandleView);

    configureCommand(context, CreateElementCommand);
});

export function createTontoDiagramContainer(widgetId: string): Container {

    const container = new Container();
    loadDefaultModules(container, { exclude: [labelEditUiModule] });
    container.load(tontoDiagramModule, edgeIntersectionModule);
    overrideViewerOptions(container, {
        needsClientLayout: true,
        needsServerLayout: true,
        baseDiv: widgetId,
        hiddenDiv: widgetId + "_hidden"
    });
    return container;
}
