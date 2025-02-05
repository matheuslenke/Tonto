/********************************************************************************
 * Copyright (c) 2021 TypeFox and others.
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

import { LayoutOptions } from "elkjs";
import { DefaultLayoutConfigurator } from "sprotty-elk/lib/elk-layout.js";
import { SGraph, SModelIndex, SNode, SPort } from "sprotty-protocol";

export class TontoLayoutConfigurator extends DefaultLayoutConfigurator {

    direction: "UP" | "DOWN" | "LEFT" | "RIGHT" = "UP";

    public setDirection(direction: "UP" | "DOWN" | "LEFT" | "RIGHT"): void {
        this.direction = direction;
    }

    protected override graphOptions(sgraph: SGraph, index: SModelIndex): LayoutOptions {
        return {
            "org.eclipse.elk.algorithm": "org.eclipse.elk.layered",
            "elk.direction": this.direction,
            "org.eclipse.elk.spacing.nodeNode": "40.0",
            "org.eclipse.elk.layered.spacing.edgeEdgeBetweenLayers": "40.0",
            "org.eclipse.elk.layered.spacing.edgeNodeBetweenLayers": "40.0",
            "org.eclipse.elk.edgeRouting": "ORTHOGONAL",
            "org.eclipse.elk.spacing.edgeEdge": "40.0",
            "org.eclipse.elk.spacing.edgeNode": "50.0",
            "org.eclipse.elk.spacing.portPort": "25.0"
        };
    }

    protected override nodeOptions(snode: SNode, index: SModelIndex): LayoutOptions {
        snode.layoutOptions = {
            vGap: 50
        };
        return {
            "org.eclipse.elk.portAlignment.default": "CENTER",
            "org.eclipse.elk.portConstraints": "FIXED_SIDE",
        };
    }

    protected override portOptions(sport: SPort, index: SModelIndex): LayoutOptions {
        return {
            "org.eclipse.elk.port.side": "None",
            "org.eclipse.elk.port.borderOffset": "3.0",
        };
    }
}
