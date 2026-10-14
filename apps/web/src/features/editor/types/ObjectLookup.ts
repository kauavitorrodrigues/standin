import type { AssetDefinition, PlacedAsset } from "@standin/contracts";

export type ObjectLookup = {
    assetsById: ReadonlyMap<string, AssetDefinition>;
    placedById: ReadonlyMap<string, PlacedAsset>;
    mapHeightPx: number;
};
