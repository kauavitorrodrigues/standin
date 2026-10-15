import { describe, expect, it } from "vitest";
import {
    STAMP_MAX_HEIGHT,
    STAMP_MAX_WIDTH,
    STAMP_MIN_SIZE,
} from "@standin/contracts";
import { NewAreaSchema } from "../newAreaSchema";

const parse = (width: number, height: number) =>
    NewAreaSchema.safeParse({ width, height }).success;

describe("NewAreaSchema", () => {
    it("accepts the limits of a stamp", () => {
        expect(parse(STAMP_MIN_SIZE, STAMP_MIN_SIZE)).toBe(true);
        expect(parse(STAMP_MAX_WIDTH, STAMP_MAX_HEIGHT)).toBe(true);
    });

    it("rejects sizes out of range", () => {
        expect(parse(STAMP_MIN_SIZE - 1, 8)).toBe(false);
        expect(parse(STAMP_MAX_WIDTH + 1, 8)).toBe(false);
        expect(parse(12, STAMP_MIN_SIZE - 1)).toBe(false);
        expect(parse(12, STAMP_MAX_HEIGHT + 1)).toBe(false);
    });

    it("rejects fractions", () => {
        expect(parse(2.5, 8)).toBe(false);
    });
});
