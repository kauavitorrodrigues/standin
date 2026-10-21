export const EMOTE_HISTORY_STORAGE_KEY = "game_emote_history";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const EMOTE_HISTORY = {
    // Uses older than this are forgotten.
    MAX_AGE_MS: 30 * MS_PER_DAY,
    // How many of the most recent uses are always kept.
    KEEP_RECENT: 20,
    // And how many more, from the rest, by score.
    KEEP_TOP_SCORED: 30,
    // How long a use weighs extra on its score.
    FRESH_WINDOW_MS: 7 * MS_PER_DAY,
    // How many emojis keep their order in the recent slots of the bar.
    MAX_RECENT_ORDER: 20,
} as const;

// How long the emoji just sent floats over the button with the bar closed.
export const SENT_BADGE_DURATION_MS = 500;
