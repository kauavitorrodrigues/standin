import {
    EDIT_SCOPES,
    StaleLayoutVersionError,
    StaleObjectsError,
} from "@standin/contracts";
import type { PublishRequest } from "@standin/contracts";
import type { DbExecutor } from "../../../../lib/types";
import { getObjectsRevision } from "../getObjectsRevision";

// The draft must start from what is in the database now: the layout version
// for a map publish, the objects revision for a decorator publish.
export const assertBaseIsCurrent = async (
    tx: DbExecutor,
    mapId: string,
    request: PublishRequest,
    currentVersion: number
): Promise<void> => {
    switch (request.scope) {
        case EDIT_SCOPES.OBJECTS: {
            const current = await getObjectsRevision(tx, mapId);
            if (current !== request.baseObjectsRevision) {
                throw new StaleObjectsError();
            }
            return;
        }
        default:
            if (currentVersion !== request.baseVersion) {
                throw new StaleLayoutVersionError(currentVersion);
            }
    }
};
