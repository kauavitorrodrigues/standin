import { describe, expect, it } from "vitest";
import { USAGE_LEVELS } from "@/features/editor/consts/usage";
import { getUsageLevel } from "@/features/editor/utils/getUsageLevel";
import { getUsagePercent } from "@/features/editor/utils/getUsagePercent";

describe("getUsageLevel", () => {
    it("is normal below 90%", () => {
        expect(getUsageLevel(0, 100)).toBe(USAGE_LEVELS.NORMAL);
        expect(getUsageLevel(89, 100)).toBe(USAGE_LEVELS.NORMAL);
    });

    it("warns from 90% up to the limit", () => {
        expect(getUsageLevel(90, 100)).toBe(USAGE_LEVELS.WARNING);
        expect(getUsageLevel(99, 100)).toBe(USAGE_LEVELS.WARNING);
    });

    it("is full at the limit, above it, or without a limit", () => {
        expect(getUsageLevel(100, 100)).toBe(USAGE_LEVELS.FULL);
        expect(getUsageLevel(120, 100)).toBe(USAGE_LEVELS.FULL);
        expect(getUsageLevel(0, 0)).toBe(USAGE_LEVELS.FULL);
    });
});

describe("getUsagePercent", () => {
    it("rounds the share and stays between 0 and 100", () => {
        expect(getUsagePercent(1, 3)).toBe(33);
        expect(getUsagePercent(150, 100)).toBe(100);
        expect(getUsagePercent(5, 0)).toBe(0);
    });
});
