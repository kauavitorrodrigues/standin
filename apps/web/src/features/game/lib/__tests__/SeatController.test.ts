import { describe, expect, it } from "vitest";
import { PLAYER_DIRECTIONS } from "@standin/contracts";
import {
    SeatController,
    type SeatedPlayer,
} from "@/features/game/lib/SeatController";
import type { SeatArea, SeatSpot } from "@/features/game/utils/buildSeatAreas";

const makeArea = (x: number, y: number): SeatArea => ({
    footprint: { x: x - 16, y: y - 16, width: 32, height: 32 },
    seats: [{ x, y, direction: PLAYER_DIRECTIONS.DOWN, depth: 0 }],
});

const makePlayer = (x: number, y: number) => {
    const player = {
        x,
        y,
        isSitting: false,
        moveAxis: { x: 0, y: 0 },
        sitAt(seat: SeatSpot) {
            player.x = seat.x;
            player.y = seat.y;
            player.isSitting = true;
        },
        standUp() {
            player.isSitting = false;
        },
        teleportTo(x: number, y: number) {
            player.x = x;
            player.y = y;
        },
    };
    return player as SeatedPlayer & typeof player;
};

describe("SeatController.setAreas", () => {
    it("sits on a seat added after the start", () => {
        const player = makePlayer(100, 100);
        const seats = new SeatController(player);

        seats.setAreas([makeArea(100, 100)]);
        seats.update();

        expect(player.isSitting).toBe(true);
    });

    it("stands the avatar up when its chair is gone", () => {
        const player = makePlayer(100, 100);
        const seats = new SeatController(player);
        seats.setAreas([makeArea(100, 100)]);
        seats.update();

        seats.setAreas([]);

        expect(player.isSitting).toBe(false);
    });

    it("stands the avatar up when its chair moved", () => {
        const player = makePlayer(100, 100);
        const seats = new SeatController(player);
        seats.setAreas([makeArea(100, 100)]);
        seats.update();

        seats.setAreas([makeArea(300, 300)]);

        expect(player.isSitting).toBe(false);
    });

    it("keeps the avatar sat when its chair is still there", () => {
        const player = makePlayer(100, 100);
        const seats = new SeatController(player);
        seats.setAreas([makeArea(100, 100)]);
        seats.update();

        seats.setAreas([makeArea(100, 100), makeArea(300, 300)]);

        expect(player.isSitting).toBe(true);
    });
});

describe("SeatController with other avatars", () => {
    const taken = (x: number, y: number) => (seat: SeatSpot) =>
        seat.x === x && seat.y === y;

    it("does not sit on a seat another avatar holds", () => {
        const player = makePlayer(100, 100);
        const seats = new SeatController(player, {
            isTaken: taken(100, 100),
            mustYield: () => false,
        });
        seats.setAreas([makeArea(100, 100)]);

        seats.update();

        expect(player.isSitting).toBe(false);
    });

    it("sits on the free seat of a piece with two", () => {
        const player = makePlayer(100, 100);
        const seats = new SeatController(player, {
            isTaken: taken(100, 100),
            mustYield: () => false,
        });
        const area: SeatArea = {
            footprint: { x: 84, y: 84, width: 64, height: 32 },
            seats: [
                { x: 100, y: 100, direction: PLAYER_DIRECTIONS.DOWN, depth: 0 },
                { x: 132, y: 100, direction: PLAYER_DIRECTIONS.DOWN, depth: 0 },
            ],
        };
        seats.setAreas([area]);

        seats.update();

        expect(player.isSitting).toBe(true);
        expect(player.x).toBe(132);
    });

    it("does not sit by surprise when the seat frees up later", () => {
        const player = makePlayer(100, 100);
        let isTaken = true;
        const seats = new SeatController(player, {
            isTaken: () => isTaken,
            mustYield: () => false,
        });
        seats.setAreas([makeArea(100, 100)]);
        seats.update();

        isTaken = false;
        seats.update();

        expect(player.isSitting).toBe(false);
    });

    it("gets up and goes back to where it was when it loses the tie", () => {
        const player = makePlayer(104, 108);
        let lost = false;
        const seats = new SeatController(player, {
            isTaken: () => false,
            mustYield: () => lost,
        });
        seats.setAreas([makeArea(100, 100)]);
        seats.update();
        expect(player.isSitting).toBe(true);

        lost = true;
        seats.update();

        expect(player.isSitting).toBe(false);
        expect({ x: player.x, y: player.y }).toEqual({ x: 104, y: 108 });
    });

    it("takes another free seat of the piece when it loses the tie", () => {
        const player = makePlayer(110, 100);
        const lostSeats = new Set(["100,100"]);
        const seats = new SeatController(player, {
            isTaken: (seat) => lostSeats.has(`${seat.x},${seat.y}`),
            mustYield: (seat) => lostSeats.has(`${seat.x},${seat.y}`),
        });
        const area: SeatArea = {
            footprint: { x: 84, y: 84, width: 64, height: 32 },
            seats: [
                { x: 100, y: 100, direction: PLAYER_DIRECTIONS.DOWN, depth: 0 },
                { x: 132, y: 100, direction: PLAYER_DIRECTIONS.DOWN, depth: 0 },
            ],
        };
        seats.setAreas([area]);
        lostSeats.clear();
        seats.update();
        expect(player.x).toBe(100);

        lostSeats.add("100,100");
        seats.update();

        expect(player.isSitting).toBe(true);
        expect(player.x).toBe(132);
    });
});
