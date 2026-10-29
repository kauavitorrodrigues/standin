import { describe, expect, it } from "vitest";
import type { StageTile } from "@/features/spaces/types/stage";
import { splitVisibleTiles } from "@/features/spaces/utils/splitVisibleTiles";

const tiles = (count: number): StageTile[] =>
    Array.from({ length: count }, (_, index) => ({
        id: `t${index}`,
        slot: "camera",
        stream: {} as MediaStream,
        userId: null,
        label: `Pessoa ${index}`,
        isSelf: false,
        isMuted: false,
        notice: null,
    }));

const ids = (result: ReturnType<typeof splitVisibleTiles>) =>
    result.visible.map((tile) => tile.id);

describe("splitVisibleTiles", () => {
    it("shows everything on one page when it fits", () => {
        const result = splitVisibleTiles(tiles(2), 2, 0);

        expect(result.visible).toHaveLength(2);
        expect(result.pageCount).toBe(1);
        expect(result.hiddenCount).toBe(0);
    });

    it("renders only a page of 6 tiles", () => {
        const result = splitVisibleTiles(tiles(6), 2, 0);

        expect(ids(result)).toEqual(["t0", "t1"]);
        expect(result.pageCount).toBe(3);
        expect(result.hiddenCount).toBe(4);
    });

    it("pages through the rest in order", () => {
        expect(ids(splitVisibleTiles(tiles(5), 2, 1))).toEqual(["t2", "t3"]);
        expect(ids(splitVisibleTiles(tiles(5), 2, 2))).toEqual(["t4"]);
    });

    it("clamps an index past the last page", () => {
        const result = splitVisibleTiles(tiles(3), 2, 9);

        expect(result.carouselIndex).toBe(1);
        expect(ids(result)).toEqual(["t2"]);
    });

    it("clamps a negative index", () => {
        expect(splitVisibleTiles(tiles(3), 2, -1).carouselIndex).toBe(0);
    });

    it("handles an empty stage", () => {
        expect(splitVisibleTiles([], 2, 0)).toEqual({
            carouselIndex: 0,
            pageCount: 1,
            visible: [],
            hiddenCount: 0,
        });
    });
});

describe("splitVisibleTiles with pinned tiles", () => {
    it("brings a pinned tile to the first page inside the same size", () => {
        const result = splitVisibleTiles(tiles(5), 2, 0, ["t4"]);

        expect(ids(result)).toEqual(["t4", "t0"]);
    });

    it("keeps the pinned tile on every page and pages the rest", () => {
        const result = splitVisibleTiles(tiles(5), 2, 1, ["t4"]);

        expect(ids(result)).toEqual(["t4", "t1"]);
        expect(result.pageCount).toBe(4);
    });

    it("does not exceed the page size when the pins fill it", () => {
        const result = splitVisibleTiles(tiles(5), 2, 3, ["t3", "t4"]);

        expect(ids(result)).toEqual(["t3", "t4"]);
        expect(result.pageCount).toBe(1);
        expect(result.hiddenCount).toBe(3);
    });
});
