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
    sprite: { w: 64, h: 32 },
    footprint: { w: 2, h: 1, offsetX: 0 },
};
const mug = {
    id: "mug",
    placement: ASSET_PLACEMENTS.SURFACE,
    solid: false,
    surfaceHeightPx: 0,
    sprite: { w: 32, h: 32 },
    footprint: { w: 1, h: 1, offsetX: 0 },
};
const tree = {
    id: "tree",
    placement: ASSET_PLACEMENTS.GROUND,
    solid: true,
    surfaceHeightPx: 0,
    sprite: { w: 64, h: 32 },
    footprint: { w: 1, h: 1, offsetX: 1 },
};
// An L shaped desk: the top row and the left column are occupied, the rest of
// the 3x3 footprint is free.
const corner = {
    id: "corner",
    placement: ASSET_PLACEMENTS.GROUND,
    solid: true,
    surfaceHeightPx: 20,
    sprite: { w: 96, h: 128 },
    footprint: {
        w: 3,
        h: 3,
        offsetX: 0,
        mask: [
            [true, true, true],
            [true, false, false],
            [true, false, false],
        ],
    },
};
const assetsById = new Map([desk, mug, tree, corner].map((a) => [a.id, a]));

const placedDesk = {
    id: "p1",
    assetId: "desk",
    tileX: 4,
    tileY: 5,
    offsetX: 0,
    offsetY: 0,
    parentId: null,
};
const placedMug = {
    id: "p2",
    assetId: "mug",
    tileX: 4,
    tileY: 5,
    offsetX: 0,
    offsetY: 0,
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

    it("shifts sprite, depth and solid rect by the pixel offset", () => {
        const base = resolvePlacedLayout(
            placedDesk,
            assetsById,
            placedById,
            MAP_HEIGHT
        );
        const shifted = resolvePlacedLayout(
            { ...placedDesk, offsetX: 10, offsetY: -6 },
            assetsById,
            placedById,
            MAP_HEIGHT
        );

        expect(shifted?.x).toBe((base?.x ?? 0) + 10);
        expect(shifted?.bottomY).toBe((base?.bottomY ?? 0) - 6);
        expect(shifted?.depth).toBeLessThan(base?.depth ?? 0);
        expect(shifted?.solidRects[0]?.x).toBe(
            (base?.solidRects[0]?.x ?? 0) + 10
        );
        expect(shifted?.solidRects[0]?.y).toBe(
            (base?.solidRects[0]?.y ?? 0) - 6
        );
    });

    it("moves the sprite left by the footprint offset", () => {
        const placed = {
            id: "p3",
            assetId: "tree",
            tileX: 3,
            tileY: 2,
            offsetX: 0,
            offsetY: 0,
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
        expect(item?.solidRects).toEqual([]);
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
        expect(layout?.solidRects).toEqual([
            { x: 128, y: 160, width: 64, height: 32 },
        ]);
    });

    it("draws an object without a mask as one slice with its own depth", () => {
        const layout = resolvePlacedLayout(
            placedDesk,
            assetsById,
            placedById,
            MAP_HEIGHT
        );
        expect(layout?.slices).toEqual([{ crop: null, depth: layout?.depth }]);
    });

    describe("with a footprint mask", () => {
        const placedCorner = {
            id: "p4",
            assetId: "corner",
            tileX: 4,
            tileY: 6,
            offsetX: 0,
            offsetY: 0,
            parentId: null,
        };
        const layoutOf = (extra: Record<string, unknown> = {}) =>
            resolvePlacedLayout(
                { ...placedCorner, ...extra },
                assetsById,
                new Map([[placedCorner.id, placedCorner]]),
                MAP_HEIGHT
            );

        it("cuts the sprite in one slice per footprint row", () => {
            const layout = layoutOf();
            expect(layout?.slices).toHaveLength(3);
            // The sprite is 128px high and the footprint 96px, so the top
            // slice also takes the 32px above the footprint.
            expect(layout?.slices.map((slice) => slice.crop)).toEqual([
                { y: 0, height: 64 },
                { y: 64, height: 32 },
                { y: 96, height: 32 },
            ]);
        });

        it("gives each slice the depth of the bottom of its own row", () => {
            const depths = layoutOf()?.slices.map((slice) => slice.depth) ?? [];
            expect(depths[0]!).toBeLessThan(depths[1]!);
            expect(depths[1]!).toBeLessThan(depths[2]!);
            expect(depths[2]!).toBeLessThan(layoutOf()!.depth);
        });

        it("draws an object in a free tile over the rows behind it", () => {
            const [top, middle] = layoutOf()!.slices;
            const chair = resolvePlacedLayout(
                {
                    ...placedMug,
                    id: "p5",
                    assetId: "tree",
                    tileX: 5,
                    tileY: 5,
                    parentId: null,
                },
                assetsById,
                new Map(),
                MAP_HEIGHT
            );
            expect(chair!.depth).toBeGreaterThan(top!.depth);
            expect(chair!.depth).toBeGreaterThan(middle!.depth);
        });

        it("blocks only the occupied tiles, merging equal runs", () => {
            expect(layoutOf()?.solidRects).toEqual([
                { x: 128, y: 128, width: 96, height: 32 },
                { x: 128, y: 160, width: 32, height: 64 },
            ]);
        });

        it("puts an item on top at the depth of its own row", () => {
            const parents = new Map([[placedCorner.id, placedCorner]]);
            const onRow = (tileY: number) =>
                resolvePlacedLayout(
                    {
                        ...placedMug,
                        tileX: 4,
                        tileY,
                        parentId: placedCorner.id,
                    },
                    assetsById,
                    parents,
                    MAP_HEIGHT
                );
            const slices = layoutOf()!.slices;

            expect(onRow(4)?.depth).toBeCloseTo(
                slices[0]!.depth + PLACED_ASSET_DEPTH.CHILD_STEP
            );
            expect(onRow(6)?.depth).toBeCloseTo(
                slices[2]!.depth + PLACED_ASSET_DEPTH.CHILD_STEP
            );
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
