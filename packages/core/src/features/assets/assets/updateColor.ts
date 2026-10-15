import { db, assetsTable, eq, inArray } from "@standin/database";
import {
    ColorMissingIssue,
    LibraryValidationError,
    validateFamily,
} from "@standin/contracts";
import type {
    LibraryAsset,
    UpdateLibraryColorSchemaType,
} from "@standin/contracts";
import {
    findScopedAsset,
    loadAssetRows,
    loadFamilyRows,
    toLibraryAssets,
} from "../utils/loadRows";
import { findRowIssues, toPatch } from "../utils/planAssetUpdate";
import { buildAssetDefinition } from "../utils/buildAssetDefinition";

export type UpdatedLibraryColor = {
    asset: LibraryAsset;
    // Every row that had the color, one per rotation.
    assets: LibraryAsset[];
};

/**
 * Renames and recolors one color of a family: every row that shares the color
 * of `assetId` gets the new key and hex together, so the family stays
 * consistent. Maps point at rows by id, so this is allowed while a map uses
 * the family.
 */
export const updateLibraryColor = async (
    assetId: string,
    organizationId: string | null,
    { color }: UpdateLibraryColorSchemaType
): Promise<UpdatedLibraryColor> => {
    const found = await findScopedAsset(assetId, organizationId);
    const family = await loadFamilyRows(found.baseAssetId ?? found.id);
    const target = family.find((row) => row.id === assetId) ?? found;
    if (target.colorKey === null) {
        throw new LibraryValidationError([new ColorMissingIssue()]);
    }

    const planned = family.map((row) =>
        row.colorKey === target.colorKey
            ? { ...row, colorKey: color.key, colorHex: color.hex }
            : row
    );
    const errors = [
        ...findRowIssues(planned),
        ...validateFamily(planned.map((row) => buildAssetDefinition(row, ""))),
    ];
    if (errors.length > 0) throw new LibraryValidationError(errors);

    const changedIds: string[] = [];
    await db.transaction(async (tx) => {
        for (const row of planned) {
            const before = family.find(({ id }) => id === row.id)!;
            const patch = toPatch(before, row);
            if (Object.keys(patch).length === 0) continue;
            await tx
                .update(assetsTable)
                .set(patch)
                .where(eq(assetsTable.id, row.id));
            changedIds.push(row.id);
        }
    });

    const rows =
        changedIds.length > 0
            ? await loadAssetRows(inArray(assetsTable.id, changedIds))
            : [target];
    const assets = await toLibraryAssets(rows);
    const asset = assets.find(({ id }) => id === assetId) ?? assets[0]!;
    return { asset, assets };
};
