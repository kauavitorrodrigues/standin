import type { Stamp } from "@standin/contracts";

export type StampAreaParams = {
    stamp: Stamp;
    // Top left corner, in tiles.
    tileX: number;
    tileY: number;
    groundLayer?: string;
    // The key of the room a private stamp creates. Left out, the next free one.
    newZoneKey?: () => string;
};
