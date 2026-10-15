import {
    db,
    assetsTable,
    filesTable,
    tilesetsTable,
    and,
    count,
    eq,
    isNull,
    max,
    or,
} from "@standin/database";
import {
    ASSET_CATEGORY_META,
    groupFamiliesByCategory,
} from "@standin/contracts";
import type { LibraryPalette } from "@standin/contracts";
import { MAP_OWNER_KINDS } from "../maps/consts/owner";
import type { MapAccess } from "../maps/types/map-access";
import { tilesetSelect } from "./consts/select";
import { loadAssetRows } from "./utils/loadRows";
import { toAssetDefinitions, toTilesets } from "./utils/toDefinitions";

// A template map only sees the global library (a template is published to
// every organization). A space map also sees the library of its organization.
const paletteScopeOf = (access: MapAccess): string | null =>
    access.owner.kind === MAP_OWNER_KINDS.TEMPLATE
        ? null
        : access.owner.organizationId;

const visibleTilesets = (organizationId: string | null) =>
    organizationId === null
        ? isNull(tilesetsTable.organizationId)
        : or(
              isNull(tilesetsTable.organizationId),
              eq(tilesetsTable.organizationId, organizationId)
          );

const visibleAssets = (organizationId: string | null) =>
    organizationId === null
        ? isNull(assetsTable.organizationId)
        : or(
              isNull(assetsTable.organizationId),
              eq(assetsTable.organizationId, organizationId)
          );

/**
 * Version of what the palette would hold. Deleted rows count: deleting bumps
 * `updated_at`, and the row would otherwise leave the max unchanged.
 */
export const getMapPaletteVersion = async (
    access: MapAccess
): Promise<string> => {
    const organizationId = paletteScopeOf(access);

    const [tilesets] = await db
        .select({ latest: max(tilesetsTable.updatedAt), total: count() })
        .from(tilesetsTable)
        .where(visibleTilesets(organizationId));
    const [assets] = await db
        .select({ latest: max(assetsTable.updatedAt), total: count() })
        .from(assetsTable)
        .where(visibleAssets(organizationId));

    const latest = Math.max(
        tilesets?.latest?.getTime() ?? 0,
        assets?.latest?.getTime() ?? 0
    );
    return `W/"${latest}-${tilesets?.total ?? 0}-${assets?.total ?? 0}"`;
};

/**
 * What the editor needs to build its palette for one map: the live tilesets,
 * and every live asset row (a base and its variations), plus the tabs ready
 * to render. Deleted rows are left out.
 */
export const buildMapPalette = async (
    access: MapAccess
): Promise<LibraryPalette> => {
    const organizationId = paletteScopeOf(access);

    const tilesetRows = await db
        .select(tilesetSelect)
        .from(tilesetsTable)
        .innerJoin(filesTable, eq(filesTable.id, tilesetsTable.fileId))
        .where(
            and(
                isNull(tilesetsTable.deletedAt),
                visibleTilesets(organizationId)
            )
        )
        .orderBy(tilesetsTable.name);

    const assetRows = await loadAssetRows(
        and(isNull(assetsTable.deletedAt), visibleAssets(organizationId))
    );
    const assets = await toAssetDefinitions(assetRows);

    const categories = [...groupFamiliesByCategory(assets)].map(
        ([category, families]) => ({
            category,
            ...ASSET_CATEGORY_META[category],
            families,
        })
    );

    return { tilesets: await toTilesets(tilesetRows), assets, categories };
};
