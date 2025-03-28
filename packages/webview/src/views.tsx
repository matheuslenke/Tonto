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

/** @jsx svg */
import { injectable } from "inversify";
import { VNode } from "snabbdom";
import { PolylineEdgeView, RenderingContext, SEdgeImpl, svg, RectangularNodeView, SNodeImpl, IViewArgs } from "sprotty";
import { Point, toDegrees } from "sprotty-protocol";


@injectable()
export class NodeView extends RectangularNodeView {
    override render(node: Readonly<SNodeImpl>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect class-sprotty-node={true}
                  class-node-package={node.type === "node:package"}
                  class-node-class={node.type === "node:class"}
                  class-node-external={node.type === "node:external"}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x='0' y='0' width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}


@injectable()
export class PolylineArrowEdgeView extends PolylineEdgeView {

    protected override renderAdditionals(edge: SEdgeImpl, segments: Point[], context: RenderingContext): VNode[] {
        const p1 = segments[segments.length - 2];
        const p2 = segments[segments.length - 1];
        return [
            <path class-sprotty-edge-arrow={false} d='M 6,-3 L 0,0 L 6,3 Z'
                  transform={`rotate(${this.angle(p2, p1)} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`}/>
        ];
    }

    angle(x0: Point, x1: Point): number {
        return toDegrees(Math.atan2(x1.y - x0.y, x1.x - x0.x));
    }
}

