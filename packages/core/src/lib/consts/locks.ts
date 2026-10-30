// Row lock modes for `select ... for update` and `for share`.
export const ROW_LOCK_MODES = {
    UPDATE: "update",
    SHARE: "share",
} as const;
