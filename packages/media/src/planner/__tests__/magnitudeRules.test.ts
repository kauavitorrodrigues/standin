import { describe, expect, it } from "vitest";
import type { ProximityMagnitude } from "@standin/contracts";
import {
    applyMagnitudeRules,
    DEFAULT_MAGNITUDE_RULES,
    focusModeRule,
    headphonesRule,
} from "../magnitudeRules";
import type { RulePlayer } from "../types";

const player = (
    id: string,
    extra: Partial<RulePlayer> = {}
): RulePlayer => ({
    id,
    roomKey: null,
    headphones: false,
    focusMode: false,
    ...extra,
});

const BASE: ProximityMagnitude = { audio: 1, video: 1 };
const NONE: ProximityMagnitude = { audio: 0, video: 0 };

describe("headphonesRule", () => {
    it("keeps the magnitude when nobody has headphones", () => {
        expect(headphonesRule(player("a"), player("b"), BASE)).toEqual(BASE);
    });

    it("zeroes the pair when the first side has headphones", () => {
        const a = player("a", { headphones: true });
        expect(headphonesRule(a, player("b"), BASE)).toEqual(NONE);
    });

    it("zeroes the pair when the second side has headphones", () => {
        const b = player("b", { headphones: true });
        expect(headphonesRule(player("a"), b, BASE)).toEqual(NONE);
    });

    it("leaves other pairs alone", () => {
        const rules = DEFAULT_MAGNITUDE_RULES;
        const a = player("a", { headphones: true });
        expect(applyMagnitudeRules(rules, a, player("b"), BASE)).toEqual(NONE);
        expect(
            applyMagnitudeRules(rules, player("b"), player("c"), BASE)
        ).toEqual(BASE);
    });
});

describe("focusModeRule", () => {
    it("is a no-op for strong connections", () => {
        const a = player("a", { focusMode: true });
        expect(focusModeRule(a, player("b"), BASE)).toEqual(BASE);
        expect(
            focusModeRule(a, player("b", { focusMode: true }), BASE)
        ).toEqual(BASE);
    });
});
