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
import { admissionEnd } from "./utils/guestState";
import { findLinkValidity } from "./utils/findLinkValidity";

/**
 * A host lets a waiting guest in. The access has no end, unless the link the
 * guest came through set a validity.
 */
export const admitSpaceGuest = async (
    spaceId: string,
    guestId: string,
    hostId: string
): Promise<SpaceGuest> => {
    const now = new Date();
    const validityHours = await findLinkValidity(spaceId, guestId);
    const row = await answerPending(
        spaceId,
        guestId,
        hostId,
        {
            status: SPACE_GUEST_STATUSES.ADMITTED,
            statusReason: SPACE_GUEST_STATUS_REASONS.HOST_ADMITTED,
            expiresAt: admissionEnd(now, validityHours),
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
