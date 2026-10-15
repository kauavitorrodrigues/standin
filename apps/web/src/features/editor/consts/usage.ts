export const USAGE_LEVELS = {
    NORMAL: "normal",
    WARNING: "warning",
    FULL: "full",
} as const;

// From this share of the limit on, the meter turns red.
export const USAGE_WARNING_PERCENT = 90;
