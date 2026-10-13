import { useMemo } from "react";
import type { MapWithUrls } from "@standin/contracts";
import { useMapRender } from "@/features/game/queries/useMapRender";
import type { GameMapData } from "@/features/game/types/tilemap";

/**
 * The map the game starts with: the one of the space plus the asset
 * definitions and placed objects of the render payload. Null while the
 * payload loads, so the engine never starts without the objects.
 */
export const useGameMapData = (map: MapWithUrls): GameMapData | null => {
    const { data } = useMapRender(map.id);

    return useMemo(
        () =>
            data ? { ...map, assets: data.assets, placed: data.placed } : null,
        [map, data]
    );
};
