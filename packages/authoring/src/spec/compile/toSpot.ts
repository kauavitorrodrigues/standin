import type { DeskSpot, SpecObject } from "../../types";

/** The anchor of an object of the spec, in the words of the builders. */
export const toSpot = ({
    asset,
    x,
    y,
    offsetX,
    offsetY,
}: SpecObject): DeskSpot => ({
    asset,
    tileX: x,
    tileY: y,
    ...(offsetX === undefined ? {} : { offsetX }),
    ...(offsetY === undefined ? {} : { offsetY }),
});
