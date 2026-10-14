import type { Tileset } from "@standin/contracts";
import { getTileOrigin } from "@/features/tilesets/utils/editor/getOrigin";
import type { TileCutout } from "@/features/tilesets/types/sheet";

// The piece of the tileset image that holds one tile, found from its index
// with the columns, margin and spacing of the tileset. It feeds the same
// background style the tileset editor uses. The url is the one the browser
// loads, already resolved.
export const getPaletteTileCutout = (
    tileset: Pick<
        Tileset,
        "widthPx" | "heightPx" | "columns" | "margin" | "spacing"
    >,
    index: number,
    zoom: number,
    url: string
): TileCutout => {
    const origin = getTileOrigin(index, tileset);

    return {
        url,
        widthPx: tileset.widthPx,
        heightPx: tileset.heightPx,
        srcX: origin.x,
        srcY: origin.y,
        zoom,
    };
};
