// How long without activity turns the person away.
export const IDLE_AWAY_AFTER_MS = 5 * 60 * 1000;

// While the person speaks into their microphone, speech counts as activity
// again this often. Well under IDLE_AWAY_AFTER_MS.
export const SPEECH_ACTIVITY_PULSE_MS = 15 * 1000;

// What counts as activity. A click on the page, the keyboard, a touch, the
// wheel and coming back to the window all do.
export const IDLE_ACTIVITY_EVENTS = [
    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "wheel",
    "focus",
] as const;

// How long the server may take to answer a status before the person is told.
export const STATUS_ACK_TIMEOUT_MS = 5000;

// What the device remembers across reloads.
export const STATUS_STORAGE_KEYS = {
    manualAway: "user_manual_away",
    customStatus: "user_custom_status",
} as const;

// When a custom status stops being shown, as the person picks it.
export const CUSTOM_STATUS_DURATIONS = {
    // Not a time: leaves the end the status already has as it is.
    KEEP: "keep",
    NEVER: "never",
    THIRTY_MINUTES: "30m",
    ONE_HOUR: "1h",
    FOUR_HOURS: "4h",
    END_OF_DAY: "today",
} as const;

export const DEFAULT_CUSTOM_STATUS_DURATION = CUSTOM_STATUS_DURATIONS.NEVER;

// How each duration reads in the choice of when the status clears.
export const CUSTOM_STATUS_DURATION_LABELS = {
    [CUSTOM_STATUS_DURATIONS.KEEP]: "Manter o prazo atual",
    [CUSTOM_STATUS_DURATIONS.NEVER]: "Não limpar",
    [CUSTOM_STATUS_DURATIONS.THIRTY_MINUTES]: "30 minutos",
    [CUSTOM_STATUS_DURATIONS.ONE_HOUR]: "1 hora",
    [CUSTOM_STATUS_DURATIONS.FOUR_HOURS]: "4 horas",
    [CUSTOM_STATUS_DURATIONS.END_OF_DAY]: "Até o fim do dia",
} as const;

// How long each fixed duration lasts. The end of the day depends on the clock.
export const CUSTOM_STATUS_DURATION_MS = {
    [CUSTOM_STATUS_DURATIONS.THIRTY_MINUTES]: 30 * 60 * 1000,
    [CUSTOM_STATUS_DURATIONS.ONE_HOUR]: 60 * 60 * 1000,
    [CUSTOM_STATUS_DURATIONS.FOUR_HOURS]: 4 * 60 * 60 * 1000,
} as const;
