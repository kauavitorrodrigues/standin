import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    MAP_RENDER_QUERY_KEY,
    useMapRender,
} from "@/features/game/queries/useMapRender";
import { useSocketEvent } from "@/features/game/multiplayer/hooks/useSocketEvent";
import type { GameEngineHandle } from "@/features/game/types/game";

/**
 * Keeps the running game in step with the map: a publication of the map or of
 * its objects (events of the space room) refetches the render payload, and
 * every payload that arrives is pushed to the scene, which draws only what
 * changed.
 */
export const useMapRenderSync = (
    handle: GameEngineHandle | null,
    mapId: string
): void => {
    const queryClient = useQueryClient();
    const { data } = useMapRender(mapId);

    const invalidate = (payload: { mapId: string }) => {
        if (payload.mapId !== mapId) return;

        void queryClient.invalidateQueries({
            queryKey: [MAP_RENDER_QUERY_KEY, mapId],
        });
    };

    useSocketEvent("map_published", invalidate);
    useSocketEvent("objects_published", invalidate);

    useEffect(() => {
        if (!handle || !data) return;

        handle.setPlaced(data.placed, data.assets);
    }, [handle, data]);
};
