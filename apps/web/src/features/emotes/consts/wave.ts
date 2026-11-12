export const WAVE = {
    // The emoji that floats over the avatar that waves.
    EMOJI: "👋",
    // Waving at the same person again is ignored for this long, so a held click
    // cannot ring the other person over and over. The server has a limit of its
    // own on space:wave for all targets together.
    SEND_COOLDOWN_MS: 3000,
    // A person who waves many times makes one sound for the receiver in this
    // window, however often the wave arrives.
    SOUND_WINDOW_MS: 5000,
    // A person who waves many times raises one toast in this window.
    TOAST_WINDOW_MS: 5000,
    SOUND_URL: "/sounds/system/wave/wave.mp3",
} as const;
