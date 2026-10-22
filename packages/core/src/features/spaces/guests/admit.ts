import {
    SPACE_GUEST_STATUS_REASONS,
    SPACE_GUEST_STATUSES,
} from "@standin/contracts";
import type { SpaceGuest } from "@standin/contracts";
import { answerPending } from "./utils/answerPending";
import {
    publishGuestListChanged,
    publishSpaceGuestEvent,
} from "./utils/guestEvents";
import { loadGuest } from "./utils/loadGuest";
import { serializeGuestState } from "./utils/serializeGuest";
import { windowEnd } from "./utils/guestState";

/** A host lets a waiting guest in, for 24 hours from now. */
export const admitSpaceGuest = async (
    spaceId: string,
    guestId: string,
    hostId: string
): Promise<SpaceGuest> => {
    const now = new Date();
    const row = await answerPending(
        spaceId,
        guestId,
        hostId,
        {
            status: SPACE_GUEST_STATUSES.ADMITTED,
            statusReason: SPACE_GUEST_STATUS_REASONS.HOST_ADMITTED,
            expiresAt: windowEnd(now),
        },
        now
    );

    await publishSpaceGuestEvent({
        type: "status",
        userId: row.userId,
        state: serializeGuestState(row, now),
    });
    await publishGuestListChanged(spaceId);
    return loadGuest(spaceId, guestId);
};
