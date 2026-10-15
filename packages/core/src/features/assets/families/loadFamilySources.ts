import { assetsTable, and, sql } from "@standin/database";
import type { LibraryAsset } from "@standin/contracts";
import { getFamilyBase } from "@standin/contracts";
import { liveAssetInScope } from "../utils/scope";
import { loadAssetRows, toLibraryAssets } from "../utils/loadRows";
import { findFamilyIdsInUse } from "../utils/usage";

// The live rows of one family: the base first, then the variations.
export type FamilySource = {
    familyId: string;
    base: LibraryAsset;
    rows: LibraryAsset[];
    // Whether any row of the family is placed on a live map.
    inUse: boolean;
};

type Filter = { familyId?: string };

/**
 * Every live family of a scope, grouped by the id of its base. Deleted rows
 * are left out. The usage flag and the parts come with them, so no caller has
 * to ask again.
 */
export const loadFamilySources = async (
    organizationId: string | null,
    filter: Filter = {}
): Promise<FamilySource[]> => {
    const familyId = sql`coalesce(${assetsTable.baseAssetId}, ${assetsTable.id})`;
    const rows = await loadAssetRows(
        and(
            liveAssetInScope(organizationId),
            filter.familyId ? sql`${familyId} = ${filter.familyId}` : undefined
        )
    );
    if (rows.length === 0) return [];

    const assets = await toLibraryAssets(rows);
    const groups = new Map<string, LibraryAsset[]>();
    for (const asset of assets) {
        const id = asset.baseAssetId ?? asset.id;
        groups.set(id, [...(groups.get(id) ?? []), asset]);
    }

    const inUse = await findFamilyIdsInUse([...groups.keys()]);
    return [...groups.entries()].flatMap(([id, members]) => {
        // A family whose base is gone cannot be shown.
        if (!members.some(({ baseAssetId }) => baseAssetId === null)) return [];
        const base = getFamilyBase(members);
        return [
            {
                familyId: id,
                base,
                rows: [base, ...members.filter((row) => row !== base)],
                inUse: inUse.has(id),
            },
        ];
    });
};
