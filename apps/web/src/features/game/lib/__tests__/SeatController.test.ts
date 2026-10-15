import { describe, expect, it } from "vitest";
import { PLAYER_DIRECTIONS } from "@standin/contracts";
import {
    SeatController,
    type SeatedPlayer,
} from "@/features/game/lib/SeatController";
import type { SeatArea, SeatSpot } from "@/features/game/utils/buildSeatAreas";

const makeArea = (x: number, y: number): SeatArea => ({
    footprint: { x: x - 16, y: y - 16, width: 32, height: 32 },
    seats: [{ x, y, direction: PLAYER_DIRECTIONS.DOWN }],
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
