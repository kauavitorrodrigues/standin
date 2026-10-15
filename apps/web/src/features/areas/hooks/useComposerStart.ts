import { useMemo } from "react";
import { AreasQueries } from "../queries";
import { buildComposerStart } from "../utils/buildComposerStart";

// What the composer opens with, once the library (and the area, when editing)
// arrived. `start` stays null while something loads, and `isError` says it
// failed or that the stamp can no longer be opened with the library.
export const useComposerStart = (areaId?: string) => {
    const palette = AreasQueries.usePalette();
    const details = AreasQueries.useDetails(areaId ?? "");
    const isEditing = areaId !== undefined;

    const paletteData = palette.palette;
    const area = details.area;
    const isReady = paletteData !== undefined && (!isEditing || area);

    const result = useMemo(() => {
        if (!isReady) return null;
        return buildComposerStart({ palette: paletteData, area });
    }, [isReady, paletteData, area]);

    return {
        start: result?.ok ? result.start : null,
        palette: {
            tilesets: palette.tilesets,
            categories: palette.categories,
            isLoading: palette.isLoading,
            isError: palette.isError,
        },
        isError:
            palette.isError ||
            (isEditing && details.isError) ||
            result?.ok === false,
    };
};
