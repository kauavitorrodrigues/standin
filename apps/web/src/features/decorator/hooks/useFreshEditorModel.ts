import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { mapPaletteQueryOptions } from "@/features/assets/queries/useMapPalette";
import { mapRenderQueryOptions } from "@/features/game/queries/useMapRender";
import { useEditorModel } from "@/features/maps/__shared__/hooks/useEditorModel";

// The base model of the decorator, but only once the map and the palette were
// fetched again after the decorator opened. The game keeps the render cached,
// and a draft built from a copy older than the lock would be refused. `model`
// is null until then.
export const useFreshEditorModel = (mapId: string) => {
    const queryClient = useQueryClient();
    const { model, isError } = useEditorModel(mapId);
    const [fresh, setFresh] = useState(false);

    useEffect(() => {
        let active = true;

        void Promise.all([
            queryClient.refetchQueries({
                queryKey: mapRenderQueryOptions(mapId).queryKey,
            }),
            queryClient.refetchQueries({
                queryKey: mapPaletteQueryOptions(mapId).queryKey,
            }),
        ]).then(() => {
            if (active) setFresh(true);
        });

        return () => {
            active = false;
        };
    }, [queryClient, mapId]);

    return { model: fresh ? model : null, isError };
};
