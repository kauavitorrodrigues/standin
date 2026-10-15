import type { TileZoom } from "../../consts/sheetZoom";
import type { TileCutout, TileSheetGrid } from "../../types/sheet";

// The tile drawn bright over the shade, or nothing when the legend is not
// highlighting its category.
export const getTileCutout = (
    show: boolean,
    url: string,
    grid: TileSheetGrid,
    origin: { x: number; y: number },
    zoom: TileZoom
): TileCutout | undefined => {
    if (!show) return undefined;
    return {
        url,
        widthPx: grid.widthPx,
        heightPx: grid.heightPx,
        srcX: origin.x,
        srcY: origin.y,
        zoom,
    };
};
