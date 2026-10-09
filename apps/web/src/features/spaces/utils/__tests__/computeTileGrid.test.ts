import { describe, expect, it } from "vitest";
import { computeTileGrid } from "@/features/spaces/utils/computeTileGrid";

const ASPECT = 16 / 9;
const base = { gap: 12, aspectRatio: ASPECT, widthTolerance: 0.85 };

const totalHeight = (count: number, columns: number, tileHeight: number) =>
    Math.ceil(count / columns) * tileHeight +
    (Math.ceil(count / columns) - 1) * base.gap;

describe("computeTileGrid", () => {
    it("has nothing to size without tiles or room", () => {
        expect(
            computeTileGrid({ count: 0, width: 800, height: 600, ...base })
        ).toMatchObject({ tileWidth: 0, tileHeight: 0 });
        expect(
            computeTileGrid({ count: 3, width: 0, height: 600, ...base })
        ).toMatchObject({ tileWidth: 0, tileHeight: 0 });
    });

    it("gives a single tile as much room as it can use", () => {
        const grid = computeTileGrid({
            count: 1,
            width: 1600,
            height: 400,
            ...base,
        });

        // Height is the limit here: 400 * 16/9.
        expect(grid.columns).toBe(1);
        expect(grid.tileWidth).toBe(711);
    });

    it("never overflows the box, whatever the size or the count", () => {
        for (const count of [1, 2, 3, 5, 8, 13]) {
            for (const [width, height] of [
                [1600, 800],
                [900, 500],
                [400, 700],
                [320, 240],
            ]) {
                const grid = computeTileGrid({
                    count,
                    width,
                    height,
                    ...base,
                });
                const usedWidth =
                    grid.columns * grid.tileWidth + (grid.columns - 1) * base.gap;

                expect(usedWidth).toBeLessThanOrEqual(width);
                expect(
                    totalHeight(count, grid.columns, grid.tileHeight)
                ).toBeLessThanOrEqual(height);
            }
        }
    });

    it("shrinks the tiles when the box gets smaller", () => {
        const large = computeTileGrid({
            count: 6,
            width: 1600,
            height: 800,
            ...base,
        });
        const small = computeTileGrid({
            count: 6,
            width: 800,
            height: 400,
            ...base,
        });

        expect(small.tileWidth).toBeLessThan(large.tileWidth);
    });

    it("stacks tiles in one column in a tall narrow box", () => {
        const grid = computeTileGrid({
            count: 3,
            width: 300,
            height: 900,
            ...base,
        });

        expect(grid.columns).toBe(1);
    });

    it("puts two tiles side by side when stacking gains almost nothing", () => {
        // 1432 x 830 is the case from the app with the sidebar open: stacked
        // tiles would be about 2% wider, which is not worth the split.
        const grid = computeTileGrid({
            count: 2,
            width: 1432,
            height: 830,
            ...base,
        });

        expect(grid.columns).toBe(2);
    });

    it("still stacks when side by side would be much smaller", () => {
        const grid = computeTileGrid({
            count: 2,
            width: 500,
            height: 900,
            ...base,
        });

        expect(grid.columns).toBe(1);
    });
});
