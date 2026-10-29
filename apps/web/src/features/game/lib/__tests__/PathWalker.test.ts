import { describe, expect, it } from "vitest";
import { PATH_SEARCH } from "@/features/game/consts/click-move";
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

    it("ends after the avatar was off the way for OFF_ROUTE_TICKS calls in a row", () => {
        const walker = new PathWalker();
        walker.start([cell(0, 0), cell(1, 0), cell(2, 0)]);

        for (let tick = 1; tick < PATH_SEARCH.OFF_ROUTE_TICKS; tick++) {
            expect(walker.next(cell(4, 4))).toBeNull();
            expect(walker.isWalking()).toBe(true);
        }
        expect(walker.next(cell(4, 4))).toBeNull();
        expect(walker.isWalking()).toBe(false);
    });

    it("goes on when the avatar is back on the way, and counts again from zero", () => {
        const walker = new PathWalker();
        walker.start([cell(0, 0), cell(1, 0), cell(2, 0)]);

        for (let tick = 1; tick < PATH_SEARCH.OFF_ROUTE_TICKS; tick++) {
            walker.next(cell(4, 4));
        }
        expect(walker.next(cell(0, 0))).toEqual({ x: 1, y: 0 });
        for (let tick = 1; tick < PATH_SEARCH.OFF_ROUTE_TICKS; tick++) {
            walker.next(cell(4, 4));
        }

        expect(walker.isWalking()).toBe(true);
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
