import { ASSET_ROTATIONS } from "../../../assets/enums/asset-rotation";
import type { AssetDefinition } from "../../../assets/types";
import {
    getColorSiblings,
    getFamilyId,
} from "../../../assets/utils/assetFamily";
import type { PlacedAsset } from "../../render/render-payload.schema";
import type { EditorModel } from "../types/editor-model";
import type { ReplaceAlternatives } from "../types/replace-alternatives";
import { canReplaceAsset } from "./canReplaceAsset";
import { resolveModelVariant } from "./resolveModelVariant";

const ROTATION_ORDER = Object.values(ASSET_ROTATIONS);

const byId = (a: AssetDefinition, b: AssetDefinition) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

// The next rotation the family has after the current one, wrapping around.
const nextRotationAsset = (
    family: AssetDefinition[],
    current: AssetDefinition
): AssetDefinition | null => {
    if (current.rotation === null) return null;
    const start = ROTATION_ORDER.indexOf(current.rotation);

    for (let step = 1; step < ROTATION_ORDER.length; step += 1) {
        const rotation = ROTATION_ORDER[(start + step) % ROTATION_ORDER.length];
        const rows = family
            .filter((asset) => asset.rotation === rotation)
            .sort(byId);
        const sameColor = rows.find(
            (asset) => asset.colorKey === current.colorKey
        );
        const target = sameColor ?? rows[0];
        if (target) return target;
    }
    return null;
};

/**
 * What the contextual bar of an object offers (spec 7.2): the other colors of
 * the current rotation, the next rotation and the other models. Every entry
 * already passed canReplaceAsset.
 */
export const getReplaceAlternatives = (
    model: EditorModel,
    placed: PlacedAsset
): ReplaceAlternatives => {
    const assets = model.library.assets;
    const current = assets.find(({ id }) => id === placed.assetId);
    if (!current) return { colors: [], rotations: [], models: [] };

    const isValid = (target: AssetDefinition) =>
        canReplaceAsset(model, placed, target).ok;
    const familyId = getFamilyId(current);
    const family = assets.filter((asset) => getFamilyId(asset) === familyId);

    const colors = getColorSiblings(assets, current).filter(
        (asset) => asset.id !== current.id && isValid(asset)
    );

    const next = nextRotationAsset(family, current);
    const rotations = next && isValid(next) ? [next] : [];

    const models = assets
        .filter(
            (base) =>
                base.baseAssetId === null &&
                base.id !== familyId &&
                base.category === current.category &&
                base.type === current.type &&
                base.placement === current.placement
        )
        .flatMap((base) => resolveModelVariant(assets, current, base) ?? [])
        .filter(isValid);

    return { colors, rotations, models };
};
