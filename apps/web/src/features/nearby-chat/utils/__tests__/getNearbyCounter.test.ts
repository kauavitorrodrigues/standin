import { describe, expect, it } from "vitest";
import { getNearbyCounter } from "../getNearbyCounter";
import { getNearbyCounterTone } from "../getNearbyCounterTone";

const text = (length: number) => "a".repeat(length);

describe("getNearbyCounter", () => {
    it("shows nothing under 35 characters", () => {
        expect(getNearbyCounter(text(34)).isVisible).toBe(false);
    });

    it("shows the counter from 35 and the warning from 40", () => {
        expect(getNearbyCounter(text(35))).toMatchObject({
            isVisible: true,
            isWarning: false,
        });
        expect(getNearbyCounter(text(39)).isWarning).toBe(false);
        expect(getNearbyCounter(text(40)).isWarning).toBe(true);
    });

    it("blocks only past 50 characters", () => {
        expect(getNearbyCounter(text(50)).isOverLimit).toBe(false);
        expect(getNearbyCounter(text(51)).isOverLimit).toBe(true);
    });

    it("exempts a link from the counter and the limit", () => {
        const link = `https://example.com/${text(100)}`;

        expect(getNearbyCounter(link)).toMatchObject({
            isVisible: false,
            isWarning: false,
            isOverLimit: false,
        });
    });
});

describe("getNearbyCounterTone", () => {
    it("is red over the limit, warning from 40 and normal before", () => {
        expect(getNearbyCounterTone(getNearbyCounter(text(51)))).toBe("error");
        expect(getNearbyCounterTone(getNearbyCounter(text(45)))).toBe(
            "warning"
        );
        expect(getNearbyCounterTone(getNearbyCounter(text(36)))).toBe("normal");
    });
});
