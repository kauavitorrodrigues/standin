export const GAME_DIAGNOSTIC_MESSAGES = {
    assetLoadFailed: (assetKey: string): string =>
        `[game] Failed to load asset "${assetKey}". Check the map's file URLs.`,
    tilesetImageMissing: (tilesetName: string): string =>
        `[game] Tileset "${tilesetName}" is not referenced by the map JSON and was skipped.`,
    tileLayerMissing: (layerName: string): string =>
        `[game] Tile layer "${layerName}" could not be created and was skipped.`,
} as const;
