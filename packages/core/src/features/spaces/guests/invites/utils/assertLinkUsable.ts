import {
    InviteLinkExhaustedError,
    InviteLinkExpiredError,
    InviteLinkRevokedError,
} from "@standin/contracts";

type UsableLink = {
    expiresAt: Date;
    revokedAt: Date | null;
    maxUses: number | null;
    usesCount: number;
};

/**
 * Throws the specific reason a link cannot start a request. The use count is
 * checked again, atomically, when a use is spent: this one only picks the
 * error to show.
 */
export const assertLinkUsable = (link: UsableLink, now: Date): void => {
    if (link.revokedAt) throw new InviteLinkRevokedError();
    if (link.expiresAt.getTime() <= now.getTime()) {
        throw new InviteLinkExpiredError();
    }
    if (link.maxUses !== null && link.usesCount >= link.maxUses) {
        throw new InviteLinkExhaustedError();
    }
};
