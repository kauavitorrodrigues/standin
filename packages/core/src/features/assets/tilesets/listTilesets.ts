import { db, filesTable, tilesetsTable, eq } from "@standin/database";
import type {
    LibraryTilesetList,
    LibraryTilesetQuerySchemaType,
} from "@standin/contracts";
import { tilesetSelect } from "../consts/select";
import { liveTilesetInScope } from "../utils/scope";
import { toTilesetSummary } from "../utils/toTilesetDetail";
import { findTilesetIdsInUse } from "../utils/usage";
import { buildTilesetFacets, filterTilesets } from "./filterTilesets";

/**
 * The live tilesets of a scope that match the filters, with whether a map
 * paints with each, and the options of every filter counted over all of them.
 */
export const listLibraryTilesets = async (
    organizationId: string | null,
    query: Partial<LibraryTilesetQuerySchemaType> = {}
): Promise<LibraryTilesetList> => {
    const rows = await db
        .select(tilesetSelect)
        .from(tilesetsTable)
        .innerJoin(filesTable, eq(filesTable.id, tilesetsTable.fileId))
        .where(liveTilesetInScope(organizationId))
        .orderBy(tilesetsTable.name);

    const inUse = await findTilesetIdsInUse(rows.map(({ id }) => id));
    const all = await Promise.all(
        rows.map((row) => toTilesetSummary(row, inUse.has(row.id)))
    );
    const tilesets = filterTilesets(all, query);

    return {
        tilesets,
        total: tilesets.length,
        facets: buildTilesetFacets(all),
    };
};
