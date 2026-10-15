import { useMemo, useState } from "react";
import type { MapRenderPayload, MapWithUrls } from "@standin/contracts";
import { useMapRender } from "@/features/game/queries/useMapRender";
import type { GameMapData } from "@/features/game/types/tilemap";

/**
 * The map the game starts with: the one of the space plus the asset
 * definitions and placed objects of the first render payload. Null while the
 * payload loads, so the engine never starts without the objects. Later
 * payloads do not rebuild it, because a new object would restart the game:
 * `useMapRenderSync` pushes them to the running scene instead.
 */
export const useGameMapData = (map: MapWithUrls): GameMapData | null => {
    const { data } = useMapRender(map.id);
    const [first, setFirst] = useState<MapRenderPayload | null>(null);

    if (!first && data) setFirst(data);

    return useMemo(() => buildGameMapData(map, first), [map, first]);
};

const buildGameMapData = (
    map: MapWithUrls,
    payload: MapRenderPayload | null
): GameMapData | null => {
    if (!payload) return null;

    return { ...map, assets: payload.assets, placed: payload.placed };
};
