import { useMemo } from "react";
import { buildEditorModel } from "@standin/contracts";
import { useMapRender } from "@/features/game/queries/useMapRender";
import { useMapPalette } from "@/features/assets/queries/useMapPalette";

// The base model of the editor: the render payload joined with the palette.
// `model` is null while either one loads or when one fails.
export const useEditorModel = (mapId: string) => {
    const render = useMapRender(mapId);
    const palette = useMapPalette(mapId);

    const renderData = render.data;
    const paletteData = palette.data;

    const model = useMemo(
        () =>
            renderData && paletteData
                ? buildEditorModel(renderData, paletteData)
                : null,
        [renderData, paletteData]
    );

    return {
        model,
        isLoading: render.isLoading || palette.isLoading,
        isError: render.isError || palette.isError,
    };
};
