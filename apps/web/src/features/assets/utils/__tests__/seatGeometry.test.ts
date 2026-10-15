import { describe, expect, it } from "vitest";
import { findSeatAt, getSeatOffsets, getSeatPoint } from "../seatGeometry";

const frame = { x: 0, y: 0, w: 64, h: 96 };

describe("seat geometry", () => {
    it("counts dy from the bottom of the frame", () => {
        expect(getSeatOffsets({ x: 16, y: 88 }, frame)).toEqual({
            dx: 16,
            dy: 8,
        });
    });

    it("keeps the seat inside the frame", () => {
        expect(getSeatOffsets({ x: 200, y: -10 }, frame)).toEqual({
            dx: 64,
            dy: 96,
        });
    });

    it("draws the seat where it was marked", () => {
        const seat = { dx: 16, dy: 8, facing: "DOWN" as const };
        expect(getSeatPoint(seat, frame)).toEqual({ x: 16, y: 88 });
    });

    it("finds the closest seat within the radius", () => {
        const seats = [
            { dx: 16, dy: 8, facing: "DOWN" as const },
            { dx: 48, dy: 8, facing: "DOWN" as const },
        ];
        expect(findSeatAt(seats, { x: 46, y: 90 }, frame, 8)).toBe(1);
        expect(findSeatAt(seats, { x: 32, y: 20 }, frame, 8)).toBe(-1);
    });
});
