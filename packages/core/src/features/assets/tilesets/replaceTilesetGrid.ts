import { db, tilesetsTable, eq } from "@standin/database";
import {
    GridMismatchIssue,
    LibraryValidationError,
    TilesetInUseError,
    pruneTileMeta,
} from "@standin/contracts";
import type { LibraryTilesetDetail } from "@standin/contracts";
import { countTiles } from "../utils/countTiles";
import { findScopedTileset } from "../utils/loadRows";
import { findTilesetIdsInUse } from "../utils/usage";
import { getLibraryTileset } from "./getTileset";

type Grid = { margin: number; spacing: number };

/**
 * Changes the margin and the spacing of a tileset, which changes how its sheet
 * is cut into tiles. The marks are kept by tile index, so what points past the
 * last tile of the new grid is dropped. A tileset that a map paints with cannot
 * change, because the tiles the map already uses would become other tiles.
 */
export const replaceLibraryTilesetGrid = async (
    id: string,
    organizationId: string | null,
    { margin, spacing }: Grid
): Promise<LibraryTilesetDetail> => {
    const tileset = await findScopedTileset(id, organizationId);
    if ((await findTilesetIdsInUse([id])).has(id)) {
        throw new TilesetInUseError();
    }

    const across = countTiles(tileset.widthPx, margin, spacing);
    const down = countTiles(tileset.heightPx, margin, spacing);
    if (across === null || down === null) {
        throw new LibraryValidationError([
            new GridMismatchIssue(
                { widthPx: tileset.widthPx, heightPx: tileset.heightPx },
                { margin, spacing }
            ),
        ]);
    }

    const tileCount = across * down;
    await db
        .update(tilesetsTable)
        .set({
            margin,
            spacing,
            columns: across,
            tileCount,
            tileMeta: tileset.tileMeta
                ? pruneTileMeta(tileset.tileMeta, tileCount)
                : null,
        })
        .where(eq(tilesetsTable.id, id));

    return getLibraryTileset(id, organizationId);
};
