export type EditorLockLostReason = "EXPIRED" | "TAKEN_OVER" | "MAP_EDITING";

export type EditorLockLostPayload = {
    mapId: string;
    // Why the session lost the lock. `MAP_EDITING` means the Studio opened
    // over a decorator.
    reason?: EditorLockLostReason;
};
