import {
    DEFAULT_EMOTES,
    RECENT_SLOT_COUNT,
    REACTION_BAR_PADDING_PX,
    REACTION_SEPARATOR_WIDTH_PX,
    REACTION_SLOT_WIDTH_PX,
} from "@/features/emotes/consts/reactions";

/**
 * How many recent reactions fit in a bar of this width. The fixed ones and the
 * button of the full picker always stay, so the recent ones are what gives way
 * first, from the last, down to none.
 *
 * @param barWidthPx - Width of the row of the bar, or null before it is known.
 * @returns A number from 0 to RECENT_SLOT_COUNT.
 */
export const getVisibleRecentCount = (
    barWidthPx: number | null,
    fixedCount: number = DEFAULT_EMOTES.length
): number => {
    if (barWidthPx === null) return RECENT_SLOT_COUNT;

    // The separator is counted as if it showed: with no room for a recent one
    // it is gone, and the result is 0 either way. The picker button takes a
    // slot of its own.
    const room =
        barWidthPx - REACTION_BAR_PADDING_PX - REACTION_SEPARATOR_WIDTH_PX;
    const slots = Math.floor(room / REACTION_SLOT_WIDTH_PX) - fixedCount - 1;

    return Math.min(RECENT_SLOT_COUNT, Math.max(0, slots));
};
