import { describe, expect, it } from "vitest";
import { keepSeatsInFrame } from "../seatList";

describe("keepSeatsInFrame", () => {
    const seats = [
        { dx: 10, dy: 10, facing: "DOWN" as const },
        { dx: 40, dy: 10, facing: "DOWN" as const },
        { dx: 10, dy: 40, facing: "UP" as const },
    ];

    it("drops the seats that fall outside the new frame", () => {
        expect(keepSeatsInFrame(seats, { w: 32, h: 32 })).toEqual([seats[0]]);
    });

    it("keeps every seat that fits", () => {
        expect(keepSeatsInFrame(seats, { w: 64, h: 64 })).toEqual(seats);
    });
});
