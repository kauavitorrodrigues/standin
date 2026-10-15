import { roundZoom } from "@/utils/roundZoom";
import { TILE_ZOOMS, type TileZoom } from "../../consts/sheetZoom";

// Keeps a zoom between the first and the last of the zooms of the sheet, in
// whole percents.
export const clampTileZoom = (zoom: number): TileZoom =>
    roundZoom(
        Math.min(
            Math.max(zoom, TILE_ZOOMS[0]),
            TILE_ZOOMS[TILE_ZOOMS.length - 1]!
        )
    );
