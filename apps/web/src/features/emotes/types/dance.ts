// The parts of a key event the dance key reads.
export type DanceKeyInfo = Pick<
    KeyboardEvent,
    "code" | "repeat" | "shiftKey" | "ctrlKey" | "metaKey" | "altKey"
>;

export type DanceHotkeyOptions = { enabled?: boolean };
