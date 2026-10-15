import type { AssetDefinition } from "../../../assets/types";
import { getFamilyId } from "../../../assets/utils/assetFamily";

const byId = (a: AssetDefinition, b: AssetDefinition) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

/**
 * The asset of another family a model swap lands on: it keeps the current
 * rotation and color when the family has them, otherwise it falls back to the
 * rotation and color of the base. Null when the family has no usable row.
 */
export const resolveModelVariant = (
    assets: AssetDefinition[],
    current: AssetDefinition,
    base: AssetDefinition
): AssetDefinition | null => {
    const family = assets.filter(
        (asset) => getFamilyId(asset) === getFamilyId(base)
    );
    const hasRotation = family.some(
        ({ rotation }) => rotation === current.rotation
    );
    const rotation = hasRotation ? current.rotation : base.rotation;
    const sameRotation = family.filter((asset) => asset.rotation === rotation);

    const colorKey = sameRotation.some(
        (asset) => asset.colorKey === current.colorKey
    )
        ? current.colorKey
        : base.colorKey;
    const byColor = sameRotation.filter((asset) => asset.colorKey === colorKey);

    const pool = byColor.length > 0 ? byColor : sameRotation;
    return pool.sort(byId)[0] ?? null;
};
