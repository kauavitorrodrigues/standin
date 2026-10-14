import type { AssetDefinition } from "../../../../assets/types";
import type { PlacedAsset } from "../../../render/render-payload.schema";
import type { EditorModel } from "../../types/editor-model";

export type PlacedWithAsset = { placed: PlacedAsset; asset: AssetDefinition };

/**
 * Placed objects paired with their asset, leaving out the ignored one and any
 * object whose asset is not in the palette.
 */
export const listPlacedWithAsset = (
    model: EditorModel,
    ignoreId?: string
): PlacedWithAsset[] => {
    const assets = new Map(
        model.library.assets.map((asset) => [asset.id, asset])
    );

    return model.placed.flatMap((placed) => {
        const asset = assets.get(placed.assetId);
        if (!asset || placed.id === ignoreId) return [];
        return [{ placed, asset }];
    });
};
