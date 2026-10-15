import type { QueryClient } from "@tanstack/react-query";
import { mapPaletteQueryOptions } from "@/features/assets/queries/useMapPalette";
import { mapRenderQueryOptions } from "@/features/game/queries/useMapRender";

// Drops what was cached of the map, so the editor reads it again after the
// lock is granted and never starts from an older copy.
export const clearEditorQueries = (queryClient: QueryClient, mapId: string) => {
    queryClient.removeQueries({
        queryKey: mapRenderQueryOptions(mapId).queryKey,
    });
    queryClient.removeQueries({
        queryKey: mapPaletteQueryOptions(mapId).queryKey,
    });
};
