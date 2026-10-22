import {
    GuestAccessDisabledError,
    SPACE_GUEST_ACCESS,
} from "@standin/contracts";
import type { InvitePreview } from "@standin/contracts";
import { db, spaceGuestsTable, and, eq, isNull } from "@standin/database";
import { findOrganizationMembership } from "../../../organizations/findMembership";
import { guestRowSelect } from "../consts/select";
import { hasLivePass } from "../utils/guestState";
import { serializeOptionalGuestState } from "../utils/serializeGuest";
import { assertLinkUsable } from "./utils/assertLinkUsable";
import { findLinkContext } from "./utils/findLinkContext";

/**
 * What the page of an invite shows before the person asks: the space, who
 * invited, and whether they already belong to it. A link that cannot start a
 * request answers with the reason, unless the person already has a live pass.
 */
export const previewInvite = async (
    userId: string,
    token: string
): Promise<InvitePreview> => {
    const now = new Date();
    const { link, space, inviterName } = await findLinkContext(token);

    const preview: InvitePreview = {
        spaceId: space.id,
        spaceName: space.name,
        inviterName,
        isMember: false,
        guest: null,
    };

    const membership = await findOrganizationMembership(
        userId,
        space.organizationId
    );
    if (membership) return { ...preview, isMember: true };

    const [row] = await db
        .select(guestRowSelect)
        .from(spaceGuestsTable)
        .where(
            and(
                eq(spaceGuestsTable.spaceId, space.id),
                eq(spaceGuestsTable.userId, userId),
                isNull(spaceGuestsTable.deletedAt)
            )
        );
    const withGuest: InvitePreview = {
        ...preview,
        guest: serializeOptionalGuestState(row, now),
    };

    if (row && hasLivePass(row, now)) return withGuest;

    if (space.guestAccess === SPACE_GUEST_ACCESS.DISABLED) {
        throw new GuestAccessDisabledError();
    }
    assertLinkUsable(link, now);

    return withGuest;
};
