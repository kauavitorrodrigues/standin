import { useMemo } from "react";
import { useMapRender } from "@/features/game/queries/useMapRender";
import { toEditorMapData } from "@/features/maps/__shared__/utils/toEditorMapData";

/**
 * The map the editor opens, from the render payload. `map` is null while the
 * payload loads, so the engine never starts without the objects.
 */
export const useEditorMapData = (mapId: string) => {
    const { data, isError } = useMapRender(mapId);

    const map = useMemo(() => (data ? toEditorMapData(data) : null), [data]);

    return { map, isError };
};
