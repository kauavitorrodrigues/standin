// The reactions of the bar that always show, in the order of the bar.
export const DEFAULT_EMOTES = ["👋", "❤️", "🎉", "🤣", "👏"] as const;

// What fills the recent slots of a person with no history yet.
export const FILL_EMOTES = ["👍", "💯", "🔥"] as const;

// How many recent reactions the bar shows after the fixed ones.
export const RECENT_SLOT_COUNT = 3;

// Sizes of the pieces of the bar in px, to know how many recent reactions fit
// in the width it has. They follow the classes of the bar: a button is size-7,
// the row has 2 px of padding on each side, and the separator is 1 px wide with
// a margin of 4 px on each side.
export const REACTION_SLOT_WIDTH_PX = 28;
export const REACTION_BAR_PADDING_PX = 4;
export const REACTION_SEPARATOR_WIDTH_PX = 9;
