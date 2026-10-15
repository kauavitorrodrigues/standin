import type {
    AssetDefinition,
    EditorModel,
    LibraryPalette,
    ModelDesk,
    PlacedAsset,
} from "@standin/contracts";
import {
    buildModel,
    placedAt,
} from "@/features/editor/utils/__tests__/placementTestKit";

const asset = (overrides: Partial<AssetDefinition>): AssetDefinition =>
    ({
        category: "SITTING",
        type: "SOFA",
        placement: "GROUND",
        footprint: { w: 2, h: 1, offsetX: 0 },
        baseAssetId: null,
        rotation: null,
        colorKey: null,
        ...overrides,
    }) as AssetDefinition;

// A sofa in red and blue facing 0, and red facing 90. A couch is another model
// of the same kind. The lamp is alone in its kind.
export const sofa = asset({ id: "sofa", rotation: "DEG_0", colorKey: "red" });
export const sofaBlue = asset({
    id: "sofa-blue",
    baseAssetId: "sofa",
    rotation: "DEG_0",
    colorKey: "blue",
});
export const sofa90 = asset({
    id: "sofa-90",
    baseAssetId: "sofa",
    rotation: "DEG_90",
    colorKey: "red",
    footprint: { w: 1, h: 2, offsetX: 0 },
});
export const couch = asset({
    id: "couch",
    rotation: "DEG_0",
    colorKey: "red",
});
export const lamp = asset({
    id: "lamp",
    type: "TV",
    footprint: { w: 1, h: 1, offsetX: 0 },
});
export const desk = asset({
    id: "desk",
    type: "DESK",
    footprint: { w: 3, h: 1, offsetX: 0 },
});

export const buildToolbarModel = (
    placed: PlacedAsset[],
    assets: AssetDefinition[] = [sofa, sofaBlue, sofa90, couch, lamp, desk],
    desks: ModelDesk[] = []
): EditorModel => ({
    ...buildModel(placed),
    library: {
        tilesets: [],
        assets,
        categories: [],
        areas: [],
    } as unknown as LibraryPalette,
    desks,
});

export { placedAt };
