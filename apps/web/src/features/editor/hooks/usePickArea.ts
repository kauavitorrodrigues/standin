import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LibraryPaletteArea } from "@standin/contracts";
import { AREA_STAMP_QUERY_KEY } from "@/features/editor/consts/areaStampQuery";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import type { EditorPalette } from "@/features/editor/types/editor-palette";

// Picks an area of the palette to place. The stamp is fetched for the version
// on the card and cached by id and version, so it never goes stale: a new
// version is another key. On success the editor goes to the select tool,
// which owns the area placement, with the stamp in `placingArea`.
export const usePickArea = (
    fetchAreaStamp: EditorPalette["fetchAreaStamp"]
) => {
    const store = useEditorStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (area: LibraryPaletteArea) => {
            const { stamp } = await queryClient.fetchQuery({
                queryKey: [AREA_STAMP_QUERY_KEY, area.id, area.version],
                queryFn: () => fetchAreaStamp(area.id, area.version),
                staleTime: Infinity,
            });
            return { area, stamp };
        },
        onSuccess: (placingArea) => {
            store.setTool(EDITOR_TOOLS.SELECT);
            store.startPlacingArea(placingArea);
        },
    });
};
