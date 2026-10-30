import { db } from "@standin/database";
import { EDIT_SCOPES } from "@standin/contracts";
import type { PublishRequest, User } from "@standin/contracts";
import { ROW_LOCK_MODES } from "../../../lib/consts/locks";
import type { MapAccess } from "../types/map-access";
import { replayPublishRequest } from "../publish/utils/replayPublishRequest";

/**
 * Runs the same checks as a publish and writes nothing. It takes no editor
 * lock and the caller has checked there is none: the transaction only holds
 * the map row, shared, for the replay and ends without a write.
 */
export const validateMapOps = async (
    user: Pick<User, "id">,
    access: MapAccess,
    request: PublishRequest
): Promise<void> => {
    await db.transaction(async (tx) => {
        await replayPublishRequest(
            tx,
            user,
            access,
            { kind: EDIT_SCOPES.MAP },
            request,
            ROW_LOCK_MODES.SHARE
        );
    });
};
