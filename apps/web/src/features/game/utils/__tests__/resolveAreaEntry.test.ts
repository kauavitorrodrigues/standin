import { describe, expect, it } from "vitest";
import { resolveAreaEntry } from "../resolveAreaEntry";

describe("resolveAreaEntry", () => {
    it("counts a walk into an area", () => {
        expect(
            resolveAreaEntry({
                previousKey: null,
                currentKey: "lounge",
                hasTraveled: true,
            })
        ).toBe(true);
    });

    it("counts a walk from one area into another", () => {
        expect(
            resolveAreaEntry({
                previousKey: "lounge",
                currentKey: "kitchen",
                hasTraveled: true,
            })
        ).toBe(true);
    });

    it("does not count staying in the same area", () => {
        expect(
            resolveAreaEntry({
                previousKey: "lounge",
                currentKey: "lounge",
                hasTraveled: true,
            })
        ).toBe(false);
    });

    it("does not count leaving an area", () => {
        expect(
            resolveAreaEntry({
                previousKey: "lounge",
                currentKey: null,
                hasTraveled: true,
            })
        ).toBe(false);
    });

    it("does not count the spawn before the avatar walked", () => {
        expect(
            resolveAreaEntry({
                previousKey: null,
                currentKey: "lounge",
                hasTraveled: false,
            })
        ).toBe(false);
    });
});
