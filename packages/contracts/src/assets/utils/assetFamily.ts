import type { AssetDefinition } from "../types";

// What the family helpers read from an asset, so the render shape, the
// palette shape and the library shape all fit.
export type FamilyMember = Pick<
    AssetDefinition,
    "id" | "baseAssetId" | "rotation" | "colorKey"
>;

const byId = (a: FamilyMember, b: FamilyMember) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

/** Id that identifies the family: the base id, or the own id for a base. */
export const getFamilyId = (asset: FamilyMember): string =>
    asset.baseAssetId ?? asset.id;

/**
 * Color variants of the same family and rotation, ordered by id. Includes the
 * current one. Empty when the current asset has no color.
 */
export function getColorSiblings<T extends FamilyMember>(
    assets: T[],
    current: T
): T[] {
    if (current.colorKey === null) return [];
    const familyId = getFamilyId(current);
    return assets
        .filter(
            (asset) =>
                getFamilyId(asset) === familyId &&
                asset.rotation === current.rotation &&
                asset.colorKey !== null
        )
        .sort(byId);
}

/** The row of a family with no `baseAssetId`. */
export function getFamilyBase<T extends FamilyMember>(familyAssets: T[]): T {
    const base = familyAssets.find((asset) => asset.baseAssetId === null);
    if (!base) throw new Error("Family has no base asset.");
    return base;
}
