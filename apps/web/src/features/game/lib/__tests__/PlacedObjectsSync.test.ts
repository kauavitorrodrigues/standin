import { describe, expect, it } from "vitest";
import {
    ASSET_PLACEMENTS,
    ASSET_TYPES,
    type AssetDefinition,
    type PlacedAsset,
} from "@standin/contracts";
import { PlacedObjectsSync } from "@/features/game/lib/PlacedObjectsSync";
import { buildDeskAreas } from "@/features/game/utils/buildDeskAreas";
import type { PlacedRect } from "@/features/game/utils/placed";

const MAP_HEIGHT = 640;

const asset = (id: string, overrides: Record<string, unknown> = {}) =>
    ({
        id,
        placement: ASSET_PLACEMENTS.GROUND,
        solid: true,
        surfaceHeightPx: 0,
        sprite: { w: 32, h: 32 },
        footprint: { w: 1, h: 1, offsetX: 0 },
        ...overrides,
    }) as unknown as AssetDefinition;

const assets = [
    asset("crate"),
    asset("barrel"),
    asset("desk", { surfaceHeightPx: 20 }),
    asset("mug", { placement: ASSET_PLACEMENTS.SURFACE, solid: false }),
];

const placed = (
    id: string,
    assetId: string,
    overrides: Partial<PlacedAsset> = {}
): PlacedAsset => ({
    id,
    assetId,
    tileX: 2,
    tileY: 3,
    offsetX: 0,
    offsetY: 0,
    parentId: null,
    propertyOverrides: null,
    ...overrides,
});

const makeSync = () => {
    const drawn = new Map<string, PlacedAsset>();
    const bodies = new Map<string, readonly PlacedRect[]>();
    const sync = new PlacedObjectsSync(
        {
            setAssets: () => undefined,
            sync: (next) => {
                drawn.clear();
                next.forEach((item) => drawn.set(item.id, item));
            },
        },
        {
            set: (id, rects) => {
                if (rects.length === 0) bodies.delete(id);
                else bodies.set(id, rects);
            },
            remove: (id) => bodies.delete(id),
        },
        MAP_HEIGHT
    );
    return { sync, drawn, bodies };
};

describe("PlacedObjectsSync", () => {
    it("adds sprites and solid bodies for new objects", () => {
        const { sync, drawn, bodies } = makeSync();

        const diff = sync.apply([placed("a", "crate")], assets);

        expect(diff.added.map((item) => item.id)).toEqual(["a"]);
        expect([...drawn.keys()]).toEqual(["a"]);
        expect(bodies.get("a")).toEqual([
            { x: 64, y: 96, width: 32, height: 32 },
        ]);
    });

    it("moves the body with the object", () => {
        const { sync, bodies } = makeSync();
        sync.apply([placed("a", "crate")], assets);

        sync.apply([placed("a", "crate", { tileX: 5 })], assets);

        expect(bodies.get("a")).toEqual([
            { x: 160, y: 96, width: 32, height: 32 },
        ]);
    });

    it("drops the body when the object is swapped for a non solid asset", () => {
        const { sync, bodies } = makeSync();
        sync.apply(
            [placed("a", "crate")],
            [...assets, asset("rug", { solid: false })]
        );

        sync.apply(
            [placed("a", "rug")],
            [...assets, asset("rug", { solid: false })]
        );

        expect(bodies.has("a")).toBe(false);
    });

    it("swaps the body for the one of the new asset", () => {
        const { sync, bodies } = makeSync();
        const wide = asset("wide", { footprint: { w: 2, h: 1, offsetX: 0 } });
        sync.apply([placed("a", "crate")], [...assets, wide]);

        sync.apply([placed("a", "wide")], [...assets, wide]);

        expect(bodies.get("a")?.[0]?.width).toBe(64);
    });

    it("removes the body of a deleted object and leaves the others", () => {
        const { sync, drawn, bodies } = makeSync();
        sync.apply(
            [placed("a", "crate"), placed("b", "barrel", { tileX: 8 })],
            assets
        );

        sync.apply([placed("b", "barrel", { tileX: 8 })], assets);

        expect([...drawn.keys()]).toEqual(["b"]);
        expect([...bodies.keys()]).toEqual(["b"]);
    });

    it("does not touch the bodies when nothing changed", () => {
        const { sync, bodies } = makeSync();
        const list = [placed("a", "crate")];
        sync.apply(list, assets);
        const before = bodies.get("a");

        sync.apply(structuredClone(list), assets);

        expect(bodies.get("a")).toBe(before);
    });

    it("lays an item out again when its desk moves, and drops it with the desk", () => {
        const { sync } = makeSync();
        const layouts: string[] = [];
        sync.subscribe((list) => layouts.push(list.map((i) => i.id).join(",")));
        const desk = placed("d", "desk");
        const mug = placed("m", "mug", { parentId: "d" });
        sync.apply([desk, mug], assets);

        sync.apply([{ ...desk, tileX: 6 }, mug], assets);
        sync.apply([], assets);

        expect(layouts).toEqual(["d,m", "d,m", ""]);
    });

    it("tells listeners after each apply and once on subscribing late", () => {
        const { sync } = makeSync();
        const calls: number[] = [];
        sync.apply([placed("a", "crate")], assets);

        sync.subscribe((list) => calls.push(list.length));
        sync.apply([], assets);

        expect(calls).toEqual([1, 0]);
    });

    it("feeds listeners the data to rebuild the desk hover targets", () => {
        const { sync } = makeSync();
        const deskAsset = asset("desk", { type: ASSET_TYPES.DESK });
        const targets: string[][] = [];
        sync.subscribe((list, assetsById) =>
            targets.push(
                buildDeskAreas(list, assetsById, MAP_HEIGHT).map(
                    (target) => target.id
                )
            )
        );

        sync.apply([], [deskAsset]);
        sync.apply([placed("d1", "desk")], [deskAsset]);
        sync.apply([], [deskAsset]);

        expect(targets).toEqual([[], ["d1"], []]);
    });
});
