import { describe, expect, it } from "vitest";
import {
    DEFAULT_EMOTES,
    RECENT_SLOT_COUNT,
    REACTION_BAR_PADDING_PX,
    REACTION_SEPARATOR_WIDTH_PX,
    REACTION_SLOT_WIDTH_PX,
} from "@/features/emotes/consts/reactions";
import { getVisibleRecentCount } from "../getVisibleRecentCount";

// Width of a bar that holds the fixed ones, the picker button, the separator
// and this many recent reactions.
const widthFor = (recents: number) =>
    REACTION_BAR_PADDING_PX +
    REACTION_SEPARATOR_WIDTH_PX +
    (DEFAULT_EMOTES.length + 1 + recents) * REACTION_SLOT_WIDTH_PX;

describe("getVisibleRecentCount", () => {
    it("shows every recent one before the width is known", () => {
        expect(getVisibleRecentCount(null)).toBe(RECENT_SLOT_COUNT);
    });

    it("shows every recent one in a wide bar, never more than the slots", () => {
        expect(getVisibleRecentCount(widthFor(RECENT_SLOT_COUNT))).toBe(RECENT_SLOT_COUNT);
        expect(getVisibleRecentCount(2000)).toBe(RECENT_SLOT_COUNT);
    });

    it("drops one recent reaction for each slot of width lost", () => {
        expect(getVisibleRecentCount(widthFor(2))).toBe(2);
        expect(getVisibleRecentCount(widthFor(1))).toBe(1);
        expect(getVisibleRecentCount(widthFor(0))).toBe(0);
    });

    it("keeps the count when the width is a few px short of the next slot", () => {
        expect(getVisibleRecentCount(widthFor(2) - 1)).toBe(1);
        expect(getVisibleRecentCount(widthFor(2) + REACTION_SLOT_WIDTH_PX - 1)).toBe(2);
    });

    it("never goes below zero, so the fixed reactions stay in a narrow bar", () => {
        expect(getVisibleRecentCount(0)).toBe(0);
        expect(getVisibleRecentCount(60)).toBe(0);
    });

    it("counts the fixed reactions it is told about", () => {
        expect(getVisibleRecentCount(widthFor(0), DEFAULT_EMOTES.length - 1)).toBe(1);
    });
});
