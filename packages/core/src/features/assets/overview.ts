import { db, assetsTable, and, count, isNull } from "@standin/database";
import { ASSET_CATEGORY_META } from "@standin/contracts";
import type { AssetCategory, LibraryOverview } from "@standin/contracts";
import { liveAssetInScope } from "./utils/scope";

/**
 * The sidebar of the library: how many families each category holds. A
 * family is its base asset, the same unit the grid lists.
 */
export const getLibraryOverview = async (
    organizationId: string | null
): Promise<LibraryOverview> => {
    const rows = await db
        .select({ category: assetsTable.category, count: count() })
        .from(assetsTable)
        .where(
            and(
                liveAssetInScope(organizationId),
                isNull(assetsTable.baseAssetId)
            )
        )
        .groupBy(assetsTable.category);

    const groups = rows
        .map(({ category, count: total }) => ({
            category: category as AssetCategory,
            ...ASSET_CATEGORY_META[category],
            count: total,
        }))
        .sort((a, b) => a.order - b.order);

    return {
        groups,
        total: groups.reduce((sum, { count: total }) => sum + total, 0),
    };
};
