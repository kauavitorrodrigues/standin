import type { TileMeta } from "../../../../assets/schemas/tile-meta.schema";
import { resolveGid } from "../../../layout/gid";
import { findTileLayer } from "../../../layout/ops/findTileLayer";
import type { EditorModel } from "../../types/editor-model";
import { toLayoutLibrary } from "../toLayoutLibrary";

type TileMetaEntry = TileMeta[string];

/** Meta of the tile painted on a layer cell, or null when the cell is empty. */
export const getTileMetaAt = (
    model: EditorModel,
    layerName: string,
    x: number,
    y: number
): TileMetaEntry | null => {
    const layer = findTileLayer(model.layout, layerName);
    const gid = layer?.data[y * model.layout.width + x];
    if (!gid) return null;

    const library = toLayoutLibrary(model.library, model.usedTilesets);
    const tile = resolveGid(model.layout, library, gid);
    if (!tile) return null;

    return (
        library.tilesets[tile.tilesetId]?.tileMeta?.[String(tile.tileIndex)] ??
        null
    );
};
