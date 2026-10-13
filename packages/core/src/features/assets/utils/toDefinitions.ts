import type { AssetDefinition, Tileset } from "@standin/contracts";
import type { AssetRow, TilesetRow } from "../types";
import { buildAssetDefinition } from "./buildAssetDefinition";
import { buildFileUrl } from "../../../lib/buildFileUrl";

/** One flat asset row as the payloads and the client see it. */
export const toAssetDefinition = async (
    row: AssetRow
): Promise<AssetDefinition> =>
    buildAssetDefinition(row, buildFileUrl(row.fileId));

export const toAssetDefinitions = (
    rows: AssetRow[]
): Promise<AssetDefinition[]> => Promise.all(rows.map(toAssetDefinition));

/** A tileset row as the palette and the render serve it. */
export const toTileset = async (row: TilesetRow): Promise<Tileset> => ({
    id: row.id,
    name: row.name,
    url: buildFileUrl(row.fileId),
    widthPx: row.widthPx,
    heightPx: row.heightPx,
    columns: row.columns,
    tileCount: row.tileCount,
    margin: row.margin,
    spacing: row.spacing,
    tileMeta: row.tileMeta,
});

export const toTilesets = (rows: TilesetRow[]): Promise<Tileset[]> =>
    Promise.all(rows.map(toTileset));
