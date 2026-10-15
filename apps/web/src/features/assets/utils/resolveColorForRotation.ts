import { getFamilyId, type AssetDefinition } from "@standin/contracts";

const byId = (a: AssetDefinition, b: AssetDefinition) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

/**
 * The asset to use when the rotation of a placed object changes: the same
 * color on the new rotation, or the first color of that rotation (by id) when
 * the color does not exist there. Null when the family has no color on it.
 */
export const resolveColorForRotation = (
    assets: AssetDefinition[],
    current: AssetDefinition,
    rotation: AssetDefinition["rotation"]
): AssetDefinition | null => {
    const candidates = assets
        .filter(
            (asset) =>
                getFamilyId(asset) === getFamilyId(current) &&
                asset.rotation === rotation &&
                asset.colorKey !== null
        )
        .sort(byId);
    return (
        candidates.find((asset) => asset.colorKey === current.colorKey) ??
        candidates[0] ??
        null
    );
};
