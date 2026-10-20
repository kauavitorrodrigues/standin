import { describe, expect, it } from "vitest";
import { PathWalker } from "@/features/game/lib/PathWalker";

const cell = (column: number, row: number) => ({ column, row });

describe("PathWalker", () => {
    it("says the direction from each tile to the next", () => {
        const walker = new PathWalker();
        walker.start([cell(0, 0), cell(1, 0), cell(1, 1)]);

        expect(walker.next(cell(0, 0))).toEqual({ x: 1, y: 0 });
        expect(walker.next(cell(1, 0))).toEqual({ x: 0, y: 1 });
    });

    it("ends on the last tile", () => {
        const walker = new PathWalker();
        walker.start([cell(0, 0), cell(1, 0)]);

        expect(walker.next(cell(1, 0))).toBeNull();
        expect(walker.isWalking()).toBe(false);
    });

    it("ends when the avatar is not on the way", () => {
        const walker = new PathWalker();
        walker.start([cell(0, 0), cell(1, 0), cell(2, 0)]);

        expect(walker.next(cell(4, 4))).toBeNull();
        expect(walker.isWalking()).toBe(false);
    });

    it("says where it is going and forgets it when cancelled", () => {
        const walker = new PathWalker();
        walker.start([cell(0, 0), cell(1, 0), cell(1, 3)]);

        expect(walker.getDestination()).toEqual(cell(1, 3));

        walker.cancel();

        expect(walker.isWalking()).toBe(false);
        expect(walker.getDestination()).toBeNull();
    });
});
