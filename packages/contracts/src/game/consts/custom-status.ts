// The limits of the custom status, the line with an emoji a person writes to
// say what they are up to.
export const CUSTOM_STATUS = {
    textMaxLength: 80,
    // The longest a status may last. "Until the end of the day" fits in it.
    maxDurationMs: 24 * 60 * 60 * 1000,
    // The longest the emoji may be. A flag or a family is a handful of code
    // points; anything longer is a grapheme built to be big.
    emojiMaxLength: 32,
    // The end is computed with the clock of the browser and checked with the
    // one of the server, so each side of the limits gets some room.
    clockToleranceMs: 60 * 1000,
    // How far in the past an end may be and still be taken.
    pastToleranceMs: 5 * 1000,
} as const;
