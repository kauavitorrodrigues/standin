import { db, tilesetsTable, and, eq, ne } from "@standin/database";
import { LibraryValidationError, TilesetInUseError } from "@standin/contracts";
import type {
    LibraryIssue,
    LibraryTilesetDetail,
    TileMeta,
} from "@standin/contracts";
import { findScopedTileset } from "../utils/loadRows";
import { liveTilesetInScope } from "../utils/scope";
import { findTilesetIdsInUse } from "../utils/usage";
import { isTileMetaAppendOnly } from "../library/utils/tileMetaUse";
import {
    findBlankDefaultIssues,
    findTileMetaRangeIssues,
} from "../library/utils/validateTileMeta";
import { getLibraryTileset } from "./getTileset";

/**
 * Replaces the `tileMeta` of a tileset, with the rules of a creation. When a
 * map already paints with the tileset, entries can only be added (or
 * `blankDefault` moved).
 */
export const replaceLibraryTileMeta = async (
    id: string,
    organizationId: string | null,
    tileMeta: TileMeta
): Promise<LibraryTilesetDetail> => {
    const tileset = await findScopedTileset(id, organizationId);

    const errors: LibraryIssue[] = findTileMetaRangeIssues(
        tileMeta,
        tileset.tileCount
    );
    if (organizationId === null) {
        const others = await db
            .select({
                id: tilesetsTable.id,
                tileCount: tilesetsTable.tileCount,
                tileMeta: tilesetsTable.tileMeta,
            })
            .from(tilesetsTable)
            .where(and(liveTilesetInScope(null), ne(tilesetsTable.id, id)));
        errors.push(
            ...findBlankDefaultIssues([
                ...others,
                { id, tileCount: tileset.tileCount, tileMeta },
            ])
        );
    }
    if (errors.length > 0) throw new LibraryValidationError(errors);

    const inUse = (await findTilesetIdsInUse([id])).has(id);
    if (inUse && !isTileMetaAppendOnly(tileset.tileMeta, tileMeta)) {
        throw new TilesetInUseError();
    }

    await db
        .update(tilesetsTable)
        .set({ tileMeta })
        .where(eq(tilesetsTable.id, id));

    return getLibraryTileset(id, organizationId);
};
