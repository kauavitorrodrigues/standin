import { describe, expect, it } from "vitest";
import { TileMover } from "@/features/game/lib/TileMover";

const SPEED = 320;
const RIGHT = { x: 1, y: 0 };
const DOWN = { x: 0, y: 1 };

const makePlayer = (x: number, y: number) => {
    const player = {
        x,
        y,
        teleportTo: (nextX: number, nextY: number) => {
            player.x = nextX;
            player.y = nextY;
        },
    };
    return player;
};

const makeMover = (isFree: (point: { x: number; y: number }) => boolean) =>
    new TileMover(SPEED, { columns: 6, rows: 6 }, isFree);

// 100 ms at 320 px/s is 32 px, one tile.
const TILE_MS = 100;

describe("TileMover", () => {
    it("steps one tile and stops on its center when the key is let go", () => {
        const mover = makeMover(() => true);
        const player = makePlayer(16, 16);

        mover.update(player, 50, () => RIGHT);
        expect(player.x).toBe(32);

        mover.update(player, 50, null);
        expect(player.x).toBe(48);
        expect(player.y).toBe(16);
        expect(mover.isStepping()).toBe(false);
    });

    it("finishes the tile it is on after the key is let go", () => {
        const mover = makeMover(() => true);
        const player = makePlayer(16, 16);

        mover.update(player, 25, () => RIGHT);
        mover.update(player, 25, null);

        expect(player.x).toBeGreaterThan(16);
        expect(player.x).toBeLessThan(48);

        mover.update(player, TILE_MS, null);
        expect(player.x).toBe(48);
    });

    it("walks tile after tile with no pause while a direction is given", () => {
        const mover = makeMover(() => true);
        const player = makePlayer(16, 16);

        mover.update(player, TILE_MS * 2, () => RIGHT);

        expect(player.x).toBe(16 + 64);
    });

    it("does not step into a closed tile and reports it", () => {
        const mover = makeMover((point) => point.x < 40);
        const player = makePlayer(16, 16);

        const result = mover.update(player, TILE_MS, () => RIGHT);

        expect(result.blocked).toBe(true);
        expect(result.axis).toEqual({ x: 0, y: 0 });
        expect(player.x).toBe(16);
    });

    it("stops at the edge of the map", () => {
        const mover = makeMover(() => true);
        const player = makePlayer(16, 16);

        const result = mover.update(player, TILE_MS, () => ({ x: -1, y: 0 }));

        expect(result.blocked).toBe(true);
        expect(player.x).toBe(16);
    });

    it("moves one axis at a time and says which", () => {
        const mover = makeMover(() => true);
        const player = makePlayer(16, 16);

        const result = mover.update(player, 50, () => DOWN);

        expect(result.axis).toEqual(DOWN);
        expect(player.x).toBe(16);
        expect(player.y).toBe(32);
    });

    it("asks for the direction on every tile it reaches", () => {
        const mover = makeMover(() => true);
        const player = makePlayer(16, 16);
        const asked: { column: number; row: number }[] = [];

        mover.update(player, TILE_MS * 2 + 10, (cell) => {
            asked.push(cell);
            return asked.length < 3 ? RIGHT : null;
        });

        expect(asked).toEqual([
            { column: 0, row: 0 },
            { column: 1, row: 0 },
            { column: 2, row: 0 },
        ]);
        expect(player.x).toBe(80);
    });

    it("lines up with the center of the next tile from off center", () => {
        const mover = makeMover(() => true);
        const player = makePlayer(20, 21);

        let asks = 0;
        mover.update(player, TILE_MS, () => (asks++ === 0 ? RIGHT : null));

        expect(player.x).toBe(48);
        expect(player.y).toBe(16);
    });

    it("drops the step when something else moved the avatar", () => {
        const mover = makeMover(() => true);
        const player = makePlayer(16, 16);

        mover.update(player, 50, () => RIGHT);
        player.teleportTo(150, 150);
        mover.update(player, 50, null);

        expect(player.x).toBe(150);
        expect(player.y).toBe(150);
    });

    it("checks the step from the standing point of its tile, not from where the avatar is", () => {
        // Blocked only at the point halfway from (23, 16), where the avatar is.
        // From the center of its tile, (16, 16), the way is open.
        const mover = makeMover((point) => !(point.x === 35.5));
        const player = makePlayer(23, 16);

        const result = mover.update(player, 50, () => RIGHT);

        expect(result.blocked).toBe(false);
        expect(player.x).toBeGreaterThan(23);
    });

    it("says where the running step ends, and nothing when still", () => {
        const mover = makeMover(() => true);
        const player = makePlayer(16, 16);

        expect(mover.getStepTarget()).toBeNull();

        mover.update(player, 50, () => RIGHT);

        expect(mover.getStepTarget()).toEqual({ x: 48, y: 16 });
    });

    it("forgets the step when cancelled", () => {
        const mover = makeMover(() => true);
        const player = makePlayer(16, 16);

        mover.update(player, 50, () => RIGHT);
        mover.cancel();

        expect(mover.isStepping()).toBe(false);
    });
});
