// Outcome of a draft storage call. A failure never throws, so the editor
// keeps working when IndexedDB is blocked or unavailable.
export type DraftDbResult<T> = { ok: true; value: T } | { ok: false };
