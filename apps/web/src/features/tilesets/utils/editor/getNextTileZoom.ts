import { getNextStep } from "@/utils/getNextStep";
import { TILE_ZOOMS, type TileZoom } from "../../consts/sheetZoom";

// The zoom one step in (1) or out (-1), stopping at the ends.
export const getNextTileZoom = (zoom: TileZoom, direction: 1 | -1): TileZoom =>
    getNextStep(TILE_ZOOMS, zoom, direction);
