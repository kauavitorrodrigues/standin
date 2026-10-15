import {
    ASSET_TYPES,
    type AssetDefinition,
    type EditorModel,
} from "@standin/contracts";

// The door assets of the library of the map.
export const getDoorAssets = (
    model: Readonly<Pick<EditorModel, "library">>
): AssetDefinition[] =>
    model.library.assets.filter(({ type }) => type === ASSET_TYPES.DOOR);

// The id the panel uses: the chosen one while the library still has it, else
// the first door asset, else null.
export const resolveDoorAssetId = (
    assets: readonly AssetDefinition[],
    chosen: string | undefined
): string | null => {
    if (assets.some(({ id }) => id === chosen)) return chosen ?? null;
    return assets[0]?.id ?? null;
};
