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

import {
    Nameable,
    PolylineEdgeRouter,
    RectangularNode,
    SEdgeImpl, SGraphImpl,
    SLabelImpl, SRoutableElementImpl,
    isEditableLabel
} from "sprotty";
import { EdgePlacement, Expandable } from "sprotty-protocol";

export class TontoGraph extends SGraphImpl {

}

export class TontoEdge extends SEdgeImpl {
    override routerKind = PolylineEdgeRouter.KIND;
    override targetAnchorCorrection = Math.sqrt(5);
}

export class TontoEdgeLabel extends SLabelImpl {
    override edgePlacement = <EdgePlacement>{
        rotate: true,
        position: 0.6
    };
}

export class TontoNode extends RectangularNode implements Nameable, Expandable {
    expanded: boolean = false;

    get editableLabel() {
        const headerComp = this.children.find(element => element.type === "comp:header");
        if (headerComp) {
            const label = headerComp.children.find(element => element.type === "label:heading");
            if (label && isEditableLabel(label)) {
                return label;
            }
        }
        return undefined;
    }

    override canConnect(routable: SRoutableElementImpl, role: string) {
        return true;
    }

    get name() {
        if (this.editableLabel) {
            return this.editableLabel.text;
        }
        return this.id;
    }
}

export class PackageNode extends RectangularNode implements Nameable {

    get name() {
        return "package";
    }
}

export class ClassLabel extends SLabelImpl { }
export class PropertyLabel extends SLabelImpl { }
