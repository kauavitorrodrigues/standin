import { beforeEach, describe, expect, it } from "vitest";
import { PLAYER_DIRECTIONS, type PlayerPosition } from "@standin/contracts";
import { SeatOccupancy } from "@/features/game/lib/SeatOccupancy";

const position = (x: number, y: number, isSitting: boolean): PlayerPosition => ({
    x,
    y,
    direction: PLAYER_DIRECTIONS.DOWN,
    isSitting,
});

const seat = { x: 16, y: 16 };

describe("SeatOccupancy", () => {
    let occupancy: SeatOccupancy;

    beforeEach(() => {
        occupancy = new SeatOccupancy();
        occupancy.setLocalSocketIdProvider(() => "m");
    });

    it("a seated peer takes the seat", () => {
        occupancy.track("z", position(16, 16, true));
        expect(occupancy.isTaken(seat)).toBe(true);
    });

    it("a standing peer with a lower id on the seat makes it unavailable", () => {
        occupancy.track("a", position(20, 20, false));
        expect(occupancy.isTaken(seat)).toBe(true);
    });

    it("a standing peer far from the seat does not", () => {
        occupancy.track("a", position(60, 16, false));
        expect(occupancy.isTaken(seat)).toBe(false);
    });

    it("a standing peer with a higher id does not, so two that arrive together do not both give up", () => {
        occupancy.track("z", position(16, 16, false));
        expect(occupancy.isTaken(seat)).toBe(false);
    });

    it("a standing peer is not seated: it does not win the tie of a sit", () => {
        occupancy.track("a", position(16, 16, false));
        expect(occupancy.mustYield(seat)).toBe(false);
    });

    it("forgets the peer when it sits elsewhere, leaves or the room is cleared", () => {
        occupancy.track("a", position(16, 16, false));
        occupancy.track("a", position(200, 200, false));
        expect(occupancy.isTaken(seat)).toBe(false);

        occupancy.track("b", position(16, 16, false));
        occupancy.remove("b");
        expect(occupancy.isTaken(seat)).toBe(false);

        occupancy.track("c", position(16, 16, false));
        occupancy.clear();
        expect(occupancy.isTaken(seat)).toBe(false);
    });

    it("does not block anything before the local id is known", () => {
        occupancy.setLocalSocketIdProvider(null);
        occupancy.track("a", position(16, 16, false));
        expect(occupancy.isTaken(seat)).toBe(false);
    });
});
