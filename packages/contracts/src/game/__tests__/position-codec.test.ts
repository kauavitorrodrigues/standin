import { describe, expect, it } from "vitest";
import { PLAYER_DIRECTIONS } from "../enums/player";
import {
    decodePosition,
    encodeEnteredPosition,
    encodePosition,
} from "../position-codec";
import { SpacePositionSchema } from "../schemas/realtime";

describe("position codec", () => {
    it.each(Object.values(PLAYER_DIRECTIONS))(
        "round trips %s, standing and sitting",
        (direction) => {
            [false, true].forEach((isSitting) => {
                const position = { x: 120, y: 340, direction, isSitting };

                expect(decodePosition(encodePosition(7, position))).toEqual({
                    shortId: 7,
                    position,
                });
            });
        }
    );

    it("carries the socket id after the position when someone enters", () => {
        const position = {
            x: 5,
            y: 6,
            direction: PLAYER_DIRECTIONS.UP,
            isSitting: false,
        };
        const tuple = encodeEnteredPosition(3, "abc", position);

        expect(tuple[4]).toBe("abc");
        expect(decodePosition(tuple)).toEqual({ shortId: 3, position });
    });

    it("reads the last direction code as right", () => {
        expect(decodePosition([7, 1, 2, 3]).position.direction).toBe(
            PLAYER_DIRECTIONS.RIGHT
        );
    });
});

describe("SpacePositionSchema", () => {
    const valid = { x: 10, y: 20, direction: "up", isSitting: false };

    it("accepts a position inside the world", () => {
        expect(SpacePositionSchema.safeParse(valid).success).toBe(true);
    });

    it.each([
        { ...valid, x: Number.NaN },
        { ...valid, y: -1 },
        { ...valid, x: 1_000_000 },
        { ...valid, direction: "diagonal" },
        { ...valid, isSitting: "yes" },
    ])("rejects %j", (candidate) => {
        expect(SpacePositionSchema.safeParse(candidate).success).toBe(false);
    });
});
