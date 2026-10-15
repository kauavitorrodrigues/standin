import type { EditScopeKind } from "./edit-scope";

export type EditorLockPayload = {
    mapId: string;
    sessionId: string;
    // Missing means `map`, which keeps older clients working.
    mode?: EditScopeKind;
};
