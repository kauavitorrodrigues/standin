import type { EditorModel } from "@standin/contracts";
import { checkOps } from "../internal/checkOps";
import { checkRectInMap } from "../internal/checkRectInMap";
import { fail } from "../internal/fail";
import type { BuildResult, SetSpawnParams } from "../types";

const DEFAULT_SPAWN_LABEL = "Spawn";

/** Adds a spawn point. A map needs at least one. */
export const setSpawn = (
    model: EditorModel,
    { tileX, tileY, label }: SetSpawnParams
): BuildResult => {
    const outside = checkRectInMap(model, "spawn", {
        x: tileX,
        y: tileY,
        w: 1,
        h: 1,
    });
    if (outside.length > 0) return fail(...outside);

    return checkOps(model, [
        {
            type: "set_zone",
            zone: {
                kind: "spawn",
                rect: { x: tileX, y: tileY, w: 1, h: 1 },
                label: label ?? DEFAULT_SPAWN_LABEL,
            },
        },
    ]);
};
