import { buildStampOps } from "@standin/contracts";
import type { EditorModel } from "@standin/contracts";
import { fail } from "../internal/fail";
import { resolveTempIds } from "../internal/tempIds";
import type { BuildOptions, BuildResult, StampAreaParams } from "../types";

/** Places an area that is already built. Finding it by key is up to the caller. */
export const stampArea = (
    model: EditorModel,
    { stamp, tileX, tileY, groundLayer, newZoneKey }: StampAreaParams,
    options?: BuildOptions
): BuildResult => {
    const built = buildStampOps(
        model,
        stamp,
        tileX,
        tileY,
        resolveTempIds(model, options),
        groundLayer,
        newZoneKey
    );
    if (!built.ok) return fail(...built.errors);

    return { ok: true, ops: built.ops };
};
