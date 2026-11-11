import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { PlacedAsset } from "@standin/contracts";
import { useAsRef } from "@/hooks/useAsRef";
import { WEBSITE_EVENTS } from "@/features/game/consts/website";
import type { GameEngineHandle } from "@/features/game/types/game";
import { WEBSITE_PREVIEW_HOVER_DWELL_MS } from "../consts/preview";
import { previewQueryOptions } from "../queries/usePreview";
import { createHoverDwell } from "../utils/createHoverDwell";
import { resolveWebsiteCard } from "../utils/resolveWebsiteCard";

// Reads the title and icon of the website of the object the mouse rests on, so
// they are already there when the person clicks. Only that one object is read:
// reading them all when the space opens would visit every site on every login.
export const usePrefetchPreview = (
    handle: GameEngineHandle | null,
    mapId: string,
    placed: readonly PlacedAsset[]
) => {
    const queryClient = useQueryClient();
    const placedRef = useAsRef(placed);

    useEffect(() => {
        if (!handle) return;

        const dwell = createHoverDwell(
            WEBSITE_PREVIEW_HOVER_DWELL_MS,
            (objectId) => {
                const data = resolveWebsiteCard(placedRef.current, objectId, [
                    window.location.origin,
                ]);
                if (data?.kind !== "available") return;

                void queryClient.prefetchQuery(
                    previewQueryOptions(mapId, objectId, data.url)
                );
            }
        );
        const unsubscribe = handle.subscribeToHover(
            WEBSITE_EVENTS.HOVER_CHANGED,
            (hover) => dwell.hover(hover?.id ?? null)
        );

        return () => {
            unsubscribe();
            dwell.cancel();
        };
    }, [handle, mapId, queryClient, placedRef]);
};
