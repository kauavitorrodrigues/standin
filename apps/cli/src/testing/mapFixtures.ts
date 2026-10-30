import { buildBlankEditorModel } from "@standin/contracts";
import type {
    AssetDefinition,
    LibraryPalette,
    MapRenderPayload,
} from "@standin/contracts";

export const MAP_ID = "map-1";
export const LAYOUT_VERSION = 7;

const CRATE = {
    id: "crate",
    key: "crate",
    name: "Crate",
    type: "DECORATION",
    category: "ROOM_DECOR",
    baseAssetId: null,
    rotation: null,
    colorKey: null,
    colorHex: null,
    url: "/crate.png",
    sprite: { w: 32, h: 32 },
    footprint: { w: 1, h: 1, offsetX: 0 },
    placement: "GROUND",
    surfaceHeightPx: 0,
    solid: false,
    action: null,
    actionParams: null,
    promptText: null,
    animation: null,
} as AssetDefinition;

// The palette of a map that has one asset, the crate.
export const buildPalette = (): LibraryPalette => ({
    tilesets: [],
    assets: [CRATE],
    categories: [],
    areas: [],
});

// The answer of GET /maps/:id/render for a blank 20x14 map.
export const buildRender = (): MapRenderPayload => {
    const model = buildBlankEditorModel({
        width: 20,
        height: 14,
        library: buildPalette(),
    });
    return {
        map: {
            id: MAP_ID,
            width: model.width,
            height: model.height,
            tileSize: 32,
            layoutVersion: LAYOUT_VERSION,
            layout: model.layout,
        },
        tilesets: [],
        assets: [],
        placed: [],
        desks: [],
        limits: { objectsUsed: 0, objectsMax: 100 },
        objectsRevision: null,
    } as unknown as MapRenderPayload;
};

export const VALID_SPEC = `kind: map
sizeTier: S
objects:
  - { asset: crate, x: 3, y: 3 }
spawns:
  - { x: 1, y: 1 }
`;

export const UNKNOWN_KEY_SPEC = `kind: map
sizeTier: S
objects:
  - { asset: ghost, x: 3, y: 3 }
spawns:
  - { x: 1, y: 1 }
`;

export const AREA_SPEC = `kind: area
size: { width: 4, height: 4 }
`;
