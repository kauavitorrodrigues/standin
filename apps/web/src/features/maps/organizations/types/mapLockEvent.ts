import type { MapLockedPayload, MapUnlockedPayload } from "@standin/contracts";

export type MapLockEvent =
    | { type: "locked"; payload: MapLockedPayload }
    | { type: "unlocked"; payload: MapUnlockedPayload };
