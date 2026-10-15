import type {
    AssetDefinition,
    EditorModel,
    LibraryPalette,
    MapLayout,
    PlacedAsset,
} from "@standin/contracts";

const asset = (overrides: Partial<AssetDefinition>): AssetDefinition =>
    ({
        id: "a",
        type: "DECORATION",
        placement: "GROUND",
        footprint: { w: 1, h: 1, offsetX: 0 },
        surfaceHeightPx: 0,
        ...overrides,
    }) as AssetDefinition;

export const crate = asset({ id: "crate" });
export const desk = asset({
    id: "desk",
    type: "DESK",
    footprint: { w: 3, h: 1, offsetX: 0 },
    surfaceHeightPx: 16,
});
export const monitor = asset({
    id: "monitor",
    type: "PLANT",
    placement: "SURFACE",
});
export const wideItem = asset({
    id: "wide",
    type: "PLANT",
    placement: "SURFACE",
    footprint: { w: 2, h: 1, offsetX: 0 },
});

export const placedAt = (
    id: string,
    assetId: string,
    tileX: number,
    tileY: number,
    parentId: string | null = null
): PlacedAsset => ({
    id,
    assetId,
    tileX,
    tileY,
    offsetX: 0,
    offsetY: 0,
    parentId,
    propertyOverrides: null,
});

export const buildModel = (
    placed: PlacedAsset[] = [],
    objectsMax = 100
): EditorModel => ({
    mapId: "map-1",
    width: 10,
    height: 10,
    layout: {
        width: 10,
        height: 10,
        layers: [],
        tilesets: [],
    } as unknown as MapLayout,
    placed,
    library: {
        tilesets: [],
        assets: [crate, desk, monitor, wideItem],
        categories: [],
        areas: [],
    } as unknown as LibraryPalette,
    desks: [],
    limits: { objectsUsed: placed.length, objectsMax },
    version: 1,
});
