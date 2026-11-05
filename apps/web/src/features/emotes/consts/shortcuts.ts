// The key that throws confetti, as `event.code` in lower case.
export const CONFETTI_HOTKEY_CODE = "keyf";

// The keys of the number row and the numpad that send the emojis of the bar,
// in the order of the bar. The key names are `event.code` in lower case.
export const EMOTE_HOTKEY_CODES = [
    ["digit1", "numpad1"],
    ["digit2", "numpad2"],
    ["digit3", "numpad3"],
    ["digit4", "numpad4"],
    ["digit5", "numpad5"],
    ["digit6", "numpad6"],
    ["digit7", "numpad7"],
    ["digit8", "numpad8"],
] as const;

// The key that dances while it is held, as `event.code` in lower case.
export const DANCE_HOTKEY_CODE = "keyz";
