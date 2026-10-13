import type { TilesetRow } from "../../assets/types";

export const toTilesetRowMap = (rows: TilesetRow[]): Map<string, TilesetRow> =>
    new Map(rows.map((row) => [row.id, row]));
