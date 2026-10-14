import type { QueryClient } from "@tanstack/react-query";
import { MAP_PALETTE_QUERY_KEY } from "@/features/assets/queries/useMapPalette";
import { AREAS_QUERY_KEY } from "../queries/useAll";
import { AREA_DETAILS_QUERY_KEY } from "../queries/useDetails";

// Everything that shows the areas: the list, the detail of each and the
// palette of the maps, whose "Áreas" tab lists them.
export const invalidateAreas = (queryClient: QueryClient) =>
    Promise.all([
        queryClient.invalidateQueries({ queryKey: [AREAS_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [AREA_DETAILS_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [MAP_PALETTE_QUERY_KEY] }),
    ]);
