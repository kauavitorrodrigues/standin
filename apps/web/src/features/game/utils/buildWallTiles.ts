import type {
    WallTileEntry,
    WallTileMeta,
} from "@/features/game/types/wall-tile";

type TileRows = readonly (readonly { index: number }[])[];

// The tiles of the walls layer, each with what it does. `metaOf` answers for a
// gid and is the only part that knows where the meta comes from.
export const buildWallTiles = (
    rows: TileRows,
    metaOf: (gid: number) => WallTileMeta
): WallTileEntry[] =>
    rows.flatMap((tiles, row) =>
        tiles.flatMap((tile, column) =>
            tile.index > 0
                ? [{ column, row, gid: tile.index, meta: metaOf(tile.index) }]
                : []
        )
    );
