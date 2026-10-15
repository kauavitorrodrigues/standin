import {
    ACTION_PARAMS_SCHEMAS,
    ActionParamsInvalidIssue,
    ActionParamsWithoutActionIssue,
    FootprintInvalidIssue,
    TILE_SIZE,
} from "@standin/contracts";
import type { AssetDefinition, LibraryIssue } from "@standin/contracts";

type Frame = { w: number; h: number };
type Footprint = { w: number; h: number; offsetX?: number };

/** The footprint has to fit the frame of the sprite, in tiles. */
export const findFootprintIssue = (
    footprint: Footprint,
    frame: Frame
): LibraryIssue | null => {
    const fits =
        (footprint.offsetX ?? 0) + footprint.w <= frame.w / TILE_SIZE &&
        footprint.h <= frame.h / TILE_SIZE;
    return fits ? null : new FootprintInvalidIssue();
};

/** `actionParams` need an action, and have to match the schema of it. */
export const findActionParamsIssue = (
    action: AssetDefinition["action"],
    actionParams: AssetDefinition["actionParams"]
): LibraryIssue | null => {
    if (!action) {
        return actionParams === null
            ? null
            : new ActionParamsWithoutActionIssue();
    }
    const parsed = ACTION_PARAMS_SCHEMAS[action].safeParse(actionParams);
    return parsed.success
        ? null
        : new ActionParamsInvalidIssue(parsed.error.issues[0]?.message);
};
