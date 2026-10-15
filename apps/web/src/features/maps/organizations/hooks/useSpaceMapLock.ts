import { useState } from "react";
import type { MapLockState } from "@standin/contracts";
import { useMapRender } from "@/features/game/queries/useMapRender";
import { useSocketEvent } from "@/features/game/multiplayer/hooks/useSocketEvent";
import type { MapLockEvent } from "../types/mapLockEvent";
import { applyMapLockEvent } from "../utils/applyMapLockEvent";

const FREE: MapLockState = { locked: false };

// Lock of the space map: starts from the render payload and follows the
// map_locked and map_unlocked events of the space room. `isLocked` is what
// table actions use to disable themselves.
export const useSpaceMapLock = (mapId: string) => {
    const { data } = useMapRender(mapId);
    const [live, setLive] = useState<MapLockState | null>(null);

    const lock = live ?? data?.lock ?? FREE;

    const handle = (event: MapLockEvent) =>
        setLive((prev) =>
            applyMapLockEvent(prev ?? data?.lock ?? FREE, event, mapId)
        );

    useSocketEvent("map_locked", (payload) =>
        handle({ type: "locked", payload })
    );
    useSocketEvent("map_unlocked", (payload) =>
        handle({ type: "unlocked", payload })
    );

    return { ...lock, isLocked: lock.locked };
};
