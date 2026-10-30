import { EDIT_SCOPES } from "@standin/contracts";
import type { EditScopeKind } from "@standin/contracts";
import { APPLY_SESSION_PREFIX } from "../consts/apply-session";
import type { LockUser } from "../types/lock-user";
import type { MapLock } from "../types/MapLock";

export type AcquireVerdict = "GRANT" | "TAKE_OVER" | "PREEMPT" | "DENY";

type VerdictInput = {
    live: MapLock | null;
    user: LockUser;
    sessionId: string;
    mode: EditScopeKind;
};

// A lock taken by an apply is never shared or taken over, not even by the
// same person: the Studio waits until the apply is done.
// Same mode: the same person takes the lock from another session, anyone
// else is refused (the first decorator holds until done). The Studio
// preempts a decorator of anyone. A decorator never preempts the Studio.
export function getAcquireVerdict({
    live,
    user,
    sessionId,
    mode,
}: VerdictInput): AcquireVerdict {
    if (!live) return "GRANT";
    if (live.sessionId.startsWith(APPLY_SESSION_PREFIX)) return "DENY";
    if (mode === EDIT_SCOPES.MAP && live.mode === EDIT_SCOPES.OBJECTS) {
        return "PREEMPT";
    }

    if (mode !== live.mode) return "DENY";
    if (live.userId !== user.id) return "DENY";
    if (live.sessionId === sessionId) return "GRANT";
    return "TAKE_OVER";
}
