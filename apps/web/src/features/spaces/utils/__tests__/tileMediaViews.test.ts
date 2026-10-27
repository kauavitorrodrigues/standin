import { describe, expect, it } from "vitest";
import type { StageTile } from "@/features/spaces/types/stage";
import { tileMediaViews } from "@/features/spaces/utils/tileMediaViews";

const stream = {} as MediaStream;

const tile = (id: string, overrides: Partial<StageTile> = {}): StageTile => ({
    id,
    slot: "camera",
    stream,
    userId: id,
    label: id,
    isSelf: false,
    isMuted: false,
    ...overrides,
});

describe("tileMediaViews", () => {
    it("gives the featured camera the layer of its width", () => {
        const a = tile("a");
        const b = tile("b");

        expect(tileMediaViews([a, b], a, 800, 1, 8)).toEqual([
            { userId: "a", layer: "high" },
        ]);
        expect(tileMediaViews([a, b], a, 300, 1, 8)).toEqual([
            { userId: "a", layer: "mid" },
        ]);
    });

    it("ignores a featured screen or the local camera", () => {
        const screen = tile("s", { slot: "screen" });
        const self = tile("me", { isSelf: true });

        expect(tileMediaViews([screen, self], screen, 800, 1, 8)).toEqual([]);
        expect(tileMediaViews([screen, self], self, 800, 1, 8)).toEqual([]);
    });

    it("gives every remote camera of the grid the grid tile layer", () => {
        const tiles = [tile("me", { isSelf: true }), tile("a"), tile("b")];

        expect(tileMediaViews(tiles, undefined, 300, 1, 8)).toEqual([
            { userId: "a", layer: "mid" },
            { userId: "b", layer: "mid" },
        ]);
    });

    it("skips people without video", () => {
        const tiles = [tile("a", { stream: null }), tile("b")];

        expect(tileMediaViews(tiles, undefined, 600, 1, 8)).toEqual([
            { userId: "b", layer: "high" },
        ]);
    });

    it("asks for nothing when the tiles are small", () => {
        const tiles = [tile("a"), tile("b")];

        expect(tileMediaViews(tiles, undefined, 200, 1, 8)).toEqual([]);
        expect(tileMediaViews(tiles, tiles[0], 200, 1, 8)).toEqual([]);
    });

    it("caps the list", () => {
        const tiles = ["a", "b", "c", "d"].map((id) => tile(id));

        expect(tileMediaViews(tiles, undefined, 600, 1, 2)).toHaveLength(2);
    });
});
