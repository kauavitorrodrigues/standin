// Postgres error code for a unique index violation.
export const UNIQUE_VIOLATION_CODE = "23505";

// Part of the name of the unique index that allows one desk per person per
// space, to tell it apart from the one that allows one person per desk.
export const USER_DESK_INDEX_MARKER = "user_id";
