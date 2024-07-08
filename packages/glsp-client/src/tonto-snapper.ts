import { GModelElement, GRoutingHandle, GridSnapper, Point } from "@eclipse-glsp/client";
import { injectable } from "inversify";

@injectable()
export class TontoSnapper extends GridSnapper {
    override snap(position: Point, element: GModelElement): Point {
        // we snap our edges to the center of the elements and our elements to the grid,
        // so to allow for nicer angles and more fine-grained control, we allow routing points to be snapped half-grid
        return element instanceof GRoutingHandle
            ? Point.snapToGrid(position, Point.divideScalar(this.grid, 2))
            : super.snap(position, element);
    }
}
