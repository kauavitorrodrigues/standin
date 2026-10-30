import { db } from "@standin/database";
import {
    LockNotHeldError,
    MAX_PUBLISH_OPS,
    PublishForbiddenError,
    PublishTooManyOpsError,
} from "@standin/contracts";
import type { PublishRequest, PublishResult, User } from "@standin/contracts";
import { MapLockService } from "../lock";
import type { MapAccess } from "../types/map-access";
import { getObjectsRevision } from "./getObjectsRevision";
import { persistModelDiff } from "./persistModelDiff";
import type { PublishOutcome } from "./types/publish-outcome";
import { canPublishInScope } from "./utils/canPublishInScope";
import { getPublishScope } from "./utils/getPublishScope";
import { getReleaseDeskIds } from "./utils/getReleaseDeskIds";
import { replayPublishRequest } from "./utils/replayPublishRequest";

/**
 * Publishes a draft: replays every operation on the model read from the
 * database and writes the difference, all in one transaction, so any failure
 * leaves the map as it was. The lock stays with whoever published.
 *
 * The `objects` scope (the decorator) needs the lock in that mode, checks the
 * base against the objects revision instead of the layout version, refuses
 * map level operations and desks of other people, and never writes the layout.
 *
 * The replay stops at the first operation that fails, so a refusal carries
 * the issues of that operation only. The request body is validated by the
 * caller. Events are emitted by the caller too, after the commit.
 */
export const publishMap = async (
    user: Pick<User, "id">,
    access: MapAccess,
    sessionId: string,
    request: PublishRequest
): Promise<PublishOutcome> => {
    const scope = getPublishScope(request);
    if (!canPublishInScope(access, scope)) throw new PublishForbiddenError();

    const lock = MapLockService.get(access.mapId);
    if (
        !lock ||
        lock.sessionId !== sessionId ||
        lock.userId !== user.id ||
        lock.mode !== scope.kind
    ) {
        throw new LockNotHeldError();
    }

    if (lock.lastPublish?.publishId === request.publishId) {
        return { result: lock.lastPublish.result, releasedDesks: [] };
    }

    if (request.ops.length > MAX_PUBLISH_OPS) {
        throw new PublishTooManyOpsError();
    }

    const { result, releasedDesks } = await db.transaction(async (tx) => {
        const { base, model } = await replayPublishRequest(
            tx,
            user,
            access,
            scope,
            request
        );

        const persisted = await persistModelDiff(tx, access, base, model, {
            releaseDeskIds: getReleaseDeskIds(request.ops),
        });

        const result: PublishResult = {
            version: persisted.version,
            idMap: persisted.idMap,
            limits: persisted.limits,
            objectsRevision: await getObjectsRevision(tx, access.mapId),
        };
        return { result, releasedDesks: persisted.releasedDesks };
    });

    MapLockService.recordPublish(access.mapId, sessionId, {
        publishId: request.publishId,
        result,
    });

    return { result, releasedDesks };
};
