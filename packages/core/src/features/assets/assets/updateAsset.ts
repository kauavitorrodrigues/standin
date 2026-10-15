import { db, assetsTable, eq, inArray } from "@standin/database";
import {
    ASSET_CATEGORIES,
    AnimationImmutableIssue,
    AssetInUseImmutableError,
    CategoryInvalidIssue,
    LibraryValidationError,
    VariationFamilyFieldError,
    validateFamily,
} from "@standin/contracts";
import type { AssetCategory, LibraryAsset } from "@standin/contracts";
import {
    FAMILY_ASSET_FIELDS,
    IN_USE_EDITABLE_ASSET_FIELDS,
} from "../consts/fields";
import {
    findScopedAsset,
    loadAssetRows,
    loadFamilyRows,
    toLibraryAssets,
} from "../utils/loadRows";
import {
    applyPlan,
    findRowIssues,
    planChanges,
    toPatch,
} from "../utils/planAssetUpdate";
import type { UpdateBody as Body } from "../utils/planAssetUpdate";
import { buildAssetDefinition } from "../utils/buildAssetDefinition";
import { findFamilyIdsInUse } from "../utils/usage";

export type UpdatedLibraryAssets = {
    asset: LibraryAsset;
    // Every row the change touched. A family field reaches the whole family.
    assets: LibraryAsset[];
    // False when the body only repeated what is stored.
    changed: boolean;
};

const isCategory = (value: string): value is AssetCategory =>
    Object.hasOwn(ASSET_CATEGORIES, value);

/**
 * Edits an asset, field by field, to the rows each field reaches: family
 * fields to the whole family, footprint and action params to the colors of the
 * same rotation, color and rotation to the row itself. Everything runs in one
 * transaction.
 * A variation only accepts the fields of its own row and of its rotation, the
 * fields of the family are edited on the base. While a map uses any row of the
 * family only `name`, `promptText` and `category` move. `key`, `type` and
 * `frameCount` never do. The footprint and the color reach this only from the
 * seed, the route rejects them.
 */
export const updateLibraryAsset = async (
    assetId: string,
    organizationId: string | null,
    body: Body
): Promise<UpdatedLibraryAssets> => {
    if (body.category !== undefined && !isCategory(body.category)) {
        throw new LibraryValidationError([
            new CategoryInvalidIssue(body.category),
        ]);
    }

    const found = await findScopedAsset(assetId, organizationId);
    const familyId = found.baseAssetId ?? found.id;
    const family = await loadFamilyRows(familyId);
    const target = family.find((row) => row.id === assetId) ?? found;

    const sentCount = body.animation?.frameCount;
    const animationLocked =
        body.animation !== undefined &&
        Object.keys(body.animation).length > 0 &&
        (target.animation === null ||
            (sentCount !== undefined &&
                sentCount !== target.animation.frameCount));
    if (animationLocked) {
        throw new LibraryValidationError([new AnimationImmutableIssue()]);
    }

    const plan = planChanges(
        target,
        body,
        body.category as AssetCategory | undefined
    );
    if (plan.fields.length === 0) {
        const [asset] = await toLibraryAssets([target]);
        return { asset: asset!, assets: [asset!], changed: false };
    }

    const familyFields = plan.fields.filter(
        (field) =>
            field === "animation" ||
            (FAMILY_ASSET_FIELDS as readonly string[]).includes(field)
    );
    if (target.baseAssetId !== null && familyFields.length > 0) {
        throw new VariationFamilyFieldError(familyFields);
    }

    const locked = plan.fields.filter(
        (field) =>
            !(IN_USE_EDITABLE_ASSET_FIELDS as readonly string[]).includes(field)
    );
    if (
        locked.length > 0 &&
        (await findFamilyIdsInUse([familyId])).has(familyId)
    ) {
        throw new AssetInUseImmutableError(locked);
    }

    const planned = applyPlan(family, target, plan);
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

    if (changedIds.length === 0) {
        const [asset] = await toLibraryAssets([target]);
        return { asset: asset!, assets: [asset!], changed: false };
    }

    const updated = await loadAssetRows(inArray(assetsTable.id, changedIds));
    const assets = await toLibraryAssets(updated);
    const asset = assets.find(({ id }) => id === assetId) ?? assets[0]!;
    return { asset, assets, changed: true };
};
