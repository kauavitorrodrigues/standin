import {
    db,
    tilesetsTable,
    and,
    eq,
    inArray,
    isNull,
    or,
} from "@standin/database";
import type { LayoutLibrary } from "@standin/contracts";
import type { DbExecutor } from "../../../lib/types";
import { libraryTilesetSelect } from "../consts/select";

/**
 * The library the pure layout functions work with: the global tilesets, the
 * ones of the map owner's organization (none for a template), and any tileset
 * the layout already uses, even a deleted one, so gids stay resolvable.
 */
export const loadLayoutLibrary = async (
    organizationId: string | null,
    usedTilesetIds: string[],
    executor: DbExecutor = db
): Promise<LayoutLibrary> => {
    const visible = and(
        isNull(tilesetsTable.deletedAt),
        organizationId === null
            ? isNull(tilesetsTable.organizationId)
            : or(
                  isNull(tilesetsTable.organizationId),
                  eq(tilesetsTable.organizationId, organizationId)
              )
    );

    const tilesets = await executor
        .select(libraryTilesetSelect)
        .from(tilesetsTable)
        .where(
            usedTilesetIds.length > 0
                ? or(visible, inArray(tilesetsTable.id, usedTilesetIds))
                : visible
        );

    return {
        tilesets: Object.fromEntries(
            tilesets.map((tileset) => [tileset.id, tileset])
        ),
    };
};
