import { describe, expect, it } from "vitest";
import { SOUNDBOARD_MIN_DURATION_MS } from "@standin/contracts";
import { moveEdge } from "../moveEdge";

const RANGE = { startMs: 1000, endMs: 4000 };

describe("moveEdge", () => {
    it("moves the start handle", () => {
        expect(moveEdge("startMs", 500, RANGE)).toEqual({
            startMs: 500,
            endMs: 4000,
        });
    });

    it("keeps the shortest clip when the start is dragged past the end", () => {
        expect(moveEdge("startMs", 9000, RANGE).startMs).toBe(
            4000 - SOUNDBOARD_MIN_DURATION_MS
        );
    });

    it("keeps the shortest clip when the end is dragged before the start", () => {
        expect(moveEdge("endMs", 0, RANGE).endMs).toBe(
            1000 + SOUNDBOARD_MIN_DURATION_MS
        );
    });
});
