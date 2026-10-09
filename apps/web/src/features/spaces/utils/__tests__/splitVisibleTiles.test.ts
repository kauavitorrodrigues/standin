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
    }));

describe("splitVisibleTiles", () => {
    it("shows everything when it fits", () => {
        const result = splitVisibleTiles(tiles(4), 4);

        expect(result.visible).toHaveLength(4);
        expect(result.hiddenCount).toBe(0);
    });

    it("counts what does not fit and keeps the first ones in order", () => {
        const result = splitVisibleTiles(tiles(10), 4);

        expect(result.visible.map((tile) => tile.id)).toEqual([
            "t0",
            "t1",
            "t2",
            "t3",
        ]);
        expect(result.hiddenCount).toBe(6);
    });

    it("handles an empty stage", () => {
        expect(splitVisibleTiles([], 4)).toEqual({
            visible: [],
            hiddenCount: 0,
        });
    });
});
