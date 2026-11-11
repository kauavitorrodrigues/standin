import { describe, expect, it } from "vitest";
import {
    ASSET_PLACEMENTS,
    EMBEDDED_WEBSITE_MODES,
    OBJECT_BEHAVIORS,
    type EmbeddedWebsiteParams,
    type ObjectBehaviorKind,
} from "@standin/contracts";
import { buildWebsiteAreas } from "../buildWebsiteAreas";

const MAP_HEIGHT = 640;

const screen: {
    id: string;
    type: "DECORATION";
    placement: typeof ASSET_PLACEMENTS.GROUND;
    solid: boolean;
    surfaceHeightPx: number;
    sprite: { w: number; h: number };
    footprint: { w: number; h: number; offsetX: number };
    behavior: ObjectBehaviorKind;
} = {
    id: "screen",
    type: "DECORATION",
    placement: ASSET_PLACEMENTS.GROUND,
    solid: true,
    surfaceHeightPx: 0,
    sprite: { w: 32, h: 48 },
    footprint: { w: 1, h: 1, offsetX: 0 },
    behavior: OBJECT_BEHAVIORS.EMBEDDED_WEBSITE,
};
const plant = {
    ...screen,
    id: "plant",
    behavior: OBJECT_BEHAVIORS.NONE,
};
const byId = (...assets: (typeof screen | typeof plant)[]) =>
    new Map(assets.map((asset) => [asset.id, asset]));

const params: EmbeddedWebsiteParams = {
    mode: EMBEDDED_WEBSITE_MODES.URL,
    url: "https://example.com",
};
const place = (
    assetId: string,
    behaviorParams: EmbeddedWebsiteParams | null,
    id = "p1"
) => ({
    id,
    assetId,
    tileX: 3,
    tileY: 5,
    offsetX: 0,
    offsetY: 0,
    parentId: null,
    behaviorParams,
});

describe("buildWebsiteAreas", () => {
    it("covers the sprite of an object that has params", () => {
        const areas = buildWebsiteAreas(
            [place("screen", params)],
            byId(screen),
            MAP_HEIGHT
        );
        expect(areas).toEqual([
            {
                id: "p1",
                bounds: { x: 96, y: 144, width: 32, height: 48 },
            },
        ]);
    });

    it("leaves out an object whose params are not set", () => {
        const areas = buildWebsiteAreas(
            [place("screen", null)],
            byId(screen),
            MAP_HEIGHT
        );
        expect(areas).toEqual([]);
    });

    it("leaves out an object whose asset has no embedded website", () => {
        const areas = buildWebsiteAreas(
            [place("plant", params)],
            byId(plant),
            MAP_HEIGHT
        );
        expect(areas).toEqual([]);
    });

    it("leaves out an object whose asset is unknown", () => {
        const areas = buildWebsiteAreas(
            [place("gone", params)],
            byId(screen),
            MAP_HEIGHT
        );
        expect(areas).toEqual([]);
    });
});
