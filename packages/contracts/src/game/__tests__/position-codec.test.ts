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
        "round trips %s, in every mix of sitting and dancing",
        (direction) => {
            [false, true].forEach((isSitting) => {
                [false, true].forEach((isDancing) => {
                    const position = {
                        x: 120,
                        y: 340,
                        direction,
                        isSitting,
                        isDancing,
                    };

                    expect(decodePosition(encodePosition(7, position))).toEqual(
                        { shortId: 7, position }
                    );
                });
            });
        }
    );

    it("round trips the teleport count in the flags", () => {
        const position = {
            x: 1,
            y: 2,
            direction: PLAYER_DIRECTIONS.LEFT,
            isSitting: true,
            isDancing: false,
            teleportCount: 255,
        };

        expect(decodePosition(encodePosition(1, position)).position).toEqual(
            position
        );
    });

    it("reads a position without a count as 0", () => {
        const tuple = encodePosition(1, {
            x: 1,
            y: 2,
            direction: PLAYER_DIRECTIONS.UP,
            isSitting: false,
            isDancing: false,
        });

        expect(decodePosition(tuple).position.teleportCount).toBeUndefined();
    });

    it("sends a bad count as none and keeps the other bits", () => {
        const base = {
            x: 1,
            y: 2,
            direction: PLAYER_DIRECTIONS.RIGHT,
            isSitting: true,
            isDancing: true,
        };

        [-3, 2.5, 999, Number.NaN].forEach((teleportCount) => {
            const { position } = decodePosition(
                encodePosition(1, { ...base, teleportCount })
            );

            expect(position).toEqual(base);
        });
    });

    it("keeps the direction and the bits an old receiver reads", () => {
        const tuple = encodePosition(1, {
            x: 1,
            y: 2,
            direction: PLAYER_DIRECTIONS.DOWN,
            isSitting: true,
            isDancing: true,
            teleportCount: 9,
        });

        // An older client reads only the four low bits.
        const legacy = tuple[3] & 0b1111;
        expect(legacy).toBe(0b1101);
    });

    it("carries the socket id after the position when someone enters", () => {
        const position = {
            x: 5,
            y: 6,
            direction: PLAYER_DIRECTIONS.UP,
            isSitting: false,
            isDancing: true,
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
    const valid = {
        x: 10,
        y: 20,
        direction: "up",
        isSitting: false,
        isDancing: false,
    };

    it("accepts a position inside the world", () => {
        expect(SpacePositionSchema.safeParse(valid).success).toBe(true);
    });

    it("reads a position without the dancing state as not dancing", () => {
        const { isDancing: _omitted, ...legacy } = valid;

        expect(SpacePositionSchema.parse(legacy).isDancing).toBe(false);
    });

    describe("teleportCount", () => {
        it("keeps a valid count", () => {
            expect(
                SpacePositionSchema.parse({ ...valid, teleportCount: 7 })
                    .teleportCount
            ).toBe(7);
            expect(
                SpacePositionSchema.parse({ ...valid, teleportCount: 255 })
                    .teleportCount
            ).toBe(255);
        });

        it("reads a missing count as 0", () => {
            expect(SpacePositionSchema.parse(valid).teleportCount).toBe(0);
        });

        it.each([-1, 1.5, 256, 1e12, Number.NaN, "3", null])(
            "reads %j as 0 and still accepts the position",
            (teleportCount) => {
                const result = SpacePositionSchema.safeParse({
                    ...valid,
                    teleportCount,
                });

                expect(result.success).toBe(true);
                expect(result.data?.teleportCount).toBe(0);
            }
        );
    });

    it.each([
        { ...valid, x: Number.NaN },
        { ...valid, y: -1 },
        { ...valid, x: 1_000_000 },
        { ...valid, direction: "diagonal" },
        { ...valid, isSitting: "yes" },
        { ...valid, isDancing: "yes" },
    ])("rejects %j", (candidate) => {
        expect(SpacePositionSchema.safeParse(candidate).success).toBe(false);
    });
});
