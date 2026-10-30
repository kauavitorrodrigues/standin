import { randomUUID } from "node:crypto";
import {
    EDIT_SCOPES,
    MAX_PUBLISH_OPS,
    MapLockedError,
    PublishForbiddenError,
    PublishTooManyOpsError,
} from "@standin/contracts";
import type { ApplyRequest, PublishRequest } from "@standin/contracts";
import { APPLY_SESSION_PREFIX, MapLockService } from "../lock";
import { publishMap } from "../publish/publishMap";
import type { MapAccess } from "../types/map-access";
import type { ApplyOutcome } from "./types/apply-outcome";
import type { ApplyUser } from "./types/apply-user";
import { validateMapOps } from "./validateMapOps";

// A map the editor holds, in any mode and by anyone (the same person too),
// refuses the apply with the error a publish gives.
const throwIfLocked = (mapId: string): void => {
    const lock = MapLockService.get(mapId);
    if (!lock) return;

    throw new MapLockedError(
        { id: lock.userId, name: lock.userName },
        new Date(lock.acquiredAt).toISOString()
    );
};

/**
 * Applies a list of ops to the layout of a map without an editor session, for
 * tools: it behaves like a publish in the `map` scope. The server takes the
 * lock for the length of the call, with a session id of its own, and lets it
 * go in every case, so it never takes a lock an editor holds and never keeps
 * one. The checks, the transaction and the answer are the publish ones.
 *
 * With `validateOnly` the ops are replayed and nothing is written, and no
 * lock is taken, but a map under a lock is refused like the real call.
 */
export const applyMap = async (
    user: ApplyUser,
    access: MapAccess,
    request: ApplyRequest
): Promise<ApplyOutcome> => {
    if (!access.canEdit) throw new PublishForbiddenError();
    if (request.ops.length > MAX_PUBLISH_OPS) {
        throw new PublishTooManyOpsError();
    }

    const publishRequest: PublishRequest = {
        scope: EDIT_SCOPES.MAP,
        publishId: randomUUID(),
        baseVersion: request.baseVersion,
        ops: request.ops,
    };

    // Looked up and taken with no await in between, so nobody slips in. The
    // dry run only looks, so it answers like the real call would.
    throwIfLocked(access.mapId);

    if (request.validateOnly) {
        await validateMapOps(user, access, publishRequest);
        return { validated: true };
    }

    const sessionId = `${APPLY_SESSION_PREFIX}${randomUUID()}`;
    const acquired = MapLockService.acquire(
        access.mapId,
        { id: user.id, name: user.name },
        sessionId,
        EDIT_SCOPES.MAP
    );
    if (!acquired.ok) throw new MapLockedError(acquired.by, acquired.since);

    try {
        const outcome = await publishMap(
            user,
            access,
            sessionId,
            publishRequest
        );
        return { validated: false, ...outcome };
    } finally {
        MapLockService.release(access.mapId, sessionId);
    }
};
