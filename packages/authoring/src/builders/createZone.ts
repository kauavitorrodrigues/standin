import type { EditorModel } from "@standin/contracts";
import { checkOps } from "../internal/checkOps";
import { checkRectInMap } from "../internal/checkRectInMap";
import { fail } from "../internal/fail";
import type { BuildResult, CreateZoneParams } from "../types";

/** A named region with no walls. It has to stand inside the map. */
export const createZone = (
    model: EditorModel,
    { label, x, y, width, height }: CreateZoneParams
): BuildResult => {
    const outside = checkRectInMap(model, "zone", {
        x,
        y,
        w: width,
        h: height,
    });
    if (outside.length > 0) return fail(...outside);

    return checkOps(model, [
        {
            type: "set_zone",
            zone: { kind: "area", label, rect: { x, y, w: width, h: height } },
        },
    ]);
};
