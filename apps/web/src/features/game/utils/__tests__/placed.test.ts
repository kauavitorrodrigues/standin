import { describe, expect, it } from "vitest";
import { ASSET_PLACEMENTS } from "@standin/contracts";
import { PLACED_ASSET_DEPTH } from "@/features/game/consts/placed-assets";
import {
    resolvePlacedLayout,
    shouldPlayAnimation,
} from "@/features/game/utils/placed";

const MAP_HEIGHT = 640;

const desk = {
    id: "desk",
    placement: ASSET_PLACEMENTS.GROUND,
    solid: true,
    surfaceHeightPx: 20,
    footprint: { w: 2, h: 1, offsetX: 0 },
};
const mug = {
    id: "mug",
    placement: ASSET_PLACEMENTS.SURFACE,
    solid: false,
    surfaceHeightPx: 0,
    footprint: { w: 1, h: 1, offsetX: 0 },
};
const tree = {
    id: "tree",
    placement: ASSET_PLACEMENTS.GROUND,
    solid: true,
    surfaceHeightPx: 0,
    footprint: { w: 1, h: 1, offsetX: 1 },
};
const assetsById = new Map([desk, mug, tree].map((a) => [a.id, a]));

const placedDesk = {
    id: "p1",
    assetId: "desk",
    tileX: 4,
    tileY: 5,
    parentId: null,
};
const placedMug = {
    id: "p2",
    assetId: "mug",
    tileX: 4,
    tileY: 5,
    parentId: "p1",
};
const placedById = new Map([placedDesk, placedMug].map((p) => [p.id, p]));

describe("resolvePlacedLayout", () => {
    it("puts the sprite base at the bottom of the anchor cell", () => {
        const layout = resolvePlacedLayout(
            placedDesk,
            assetsById,
            placedById,
            MAP_HEIGHT
        );
        expect(layout?.x).toBe(128);
        expect(layout?.bottomY).toBe(192);
    });

    it("moves the sprite left by the footprint offset", () => {
        const placed = {
            id: "p3",
            assetId: "tree",
            tileX: 3,
            tileY: 2,
            parentId: null,
        };
        const layout = resolvePlacedLayout(
            placed,
            assetsById,
            new Map(),
            MAP_HEIGHT
        );
        expect(layout?.x).toBe(64);
    });

    it("rests an item on the top of its parent and draws it just above", () => {
        const parent = resolvePlacedLayout(
            placedDesk,
            assetsById,
            placedById,
            MAP_HEIGHT
        );
        const item = resolvePlacedLayout(
            placedMug,
            assetsById,
            placedById,
            MAP_HEIGHT
        );
        expect(item?.bottomY).toBe(192 - 20);
        expect(item?.depth).toBeCloseTo(
            (parent?.depth ?? 0) + PLACED_ASSET_DEPTH.CHILD_STEP
        );
        expect(item?.solidRect).toBeNull();
    });

    it("orders ground objects by the bottom of the sprite", () => {
        const back = resolvePlacedLayout(
            { ...placedDesk, id: "a", tileY: 2 },
            assetsById,
            new Map(),
            MAP_HEIGHT
        );
        const front = resolvePlacedLayout(
            { ...placedDesk, id: "b", tileY: 9 },
            assetsById,
            new Map(),
            MAP_HEIGHT
        );
        expect(front!.depth).toBeGreaterThan(back!.depth);
        expect(front!.depth).toBeLessThanOrEqual(PLACED_ASSET_DEPTH.MAX);
        expect(back!.depth).toBeGreaterThanOrEqual(PLACED_ASSET_DEPTH.MIN);
    });

    it("gives solid objects a footprint rect and others none", () => {
        const layout = resolvePlacedLayout(
            placedDesk,
            assetsById,
            placedById,
            MAP_HEIGHT
        );
        expect(layout?.solidRect).toEqual({
            x: 128,
            y: 160,
            width: 64,
            height: 32,
        });
    });

    it("skips an object whose asset or parent is unknown", () => {
        expect(
            resolvePlacedLayout(
                { ...placedDesk, assetId: "gone" },
                assetsById,
                placedById,
                MAP_HEIGHT
            )
        ).toBeNull();
        expect(
            resolvePlacedLayout(
                { ...placedMug, parentId: "gone" },
                assetsById,
                placedById,
                MAP_HEIGHT
            )
        ).toBeNull();
    });
});

describe("shouldPlayAnimation", () => {
    const animation = { frameCount: 6, frameDurationMs: 100, repeat: -1 };

    it("plays only an animated asset whose animation exists", () => {
        expect(shouldPlayAnimation({ animation }, true)).toBe(true);
        expect(shouldPlayAnimation({ animation }, false)).toBe(false);
        expect(shouldPlayAnimation({ animation: null }, true)).toBe(false);
    });
});
