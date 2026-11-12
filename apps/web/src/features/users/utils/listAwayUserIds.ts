import { AVAILABILITIES } from "@standin/contracts";
import type { RemoteStatus } from "../types/availability";

/** The people who are away, by user id. Busy is not away. */
export const listAwayUserIds = (
    statuses: ReadonlyMap<string, RemoteStatus>
): ReadonlySet<string> =>
    new Set(
        [...statuses]
            .filter(([, status]) => status.availability === AVAILABILITIES.AWAY)
            .map(([userId]) => userId)
    );
