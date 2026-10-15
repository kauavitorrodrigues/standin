import {
    ACTION_PARAMS_SCHEMAS,
    ActionParamsInvalidIssue,
    ActionParamsWithoutActionIssue,
    deriveTileMask,
    FootprintInvalidIssue,
    FootprintMaskAnimatedIssue,
    TILE_SIZE,
} from "@standin/contracts";
import type {
    AssetDefinition,
    FootprintMask,
    LibraryIssue,
} from "@standin/contracts";

type Frame = { w: number; h: number };
type Footprint = {
    w: number;
    h: number;
    offsetX?: number;
    mask?: FootprintMask | null;
    solidMask?: FootprintMask | null;
};

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

/**
 * A footprint mask (tiles or collision cells) needs a static sprite, so an
 * animated asset has none.
 */
export const findFootprintMaskIssue = (
    footprint: Pick<Footprint, "mask" | "solidMask">,
    animated: boolean
): LibraryIssue | null => {
    const masked = Boolean(footprint.mask) || Boolean(footprint.solidMask);
    return masked && animated ? new FootprintMaskAnimatedIssue() : null;
};

/**
 * The masks of a footprint as they are stored. A collision mask without a tile
 * mask implies one: a tile is occupied when one of its cells is solid.
 */
export const resolveFootprintMasks = (footprint: Footprint) => {
    const solidMask = footprint.solidMask ?? null;
    if (footprint.mask) return { mask: footprint.mask, solidMask };
    if (!solidMask) return { mask: null, solidMask: null };
    return {
        mask: deriveTileMask(solidMask, footprint.w, footprint.h),
        solidMask,
    };
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
