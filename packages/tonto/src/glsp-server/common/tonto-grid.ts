/********************************************************************************
 * Copyright (c) 2024 CrossBreeze.
 ********************************************************************************/
import { Point } from "@eclipse-glsp/server";

export class Grid {
    public static GRID_X = 5.0;
    public static GRID_Y = 5.0;

    public static snap(originalPoint: Point | undefined): Point | undefined {
        if (originalPoint) {
            return {
                x: Math.round(originalPoint.x / this.GRID_X) * this.GRID_X,
                y: Math.round(originalPoint.y / this.GRID_Y) * this.GRID_Y
            };
        } else {
            return undefined;
        }
    }
}
