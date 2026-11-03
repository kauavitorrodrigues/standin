import type { DeskChoice, DeskInput, SendInvitationsInput } from "../types";

// A desk goes with the invitations only when it was asked for and picked.
const isDeskToSend = (isDeskRequested: boolean, desk: DeskChoice): boolean =>
    isDeskRequested && desk !== null;

/** The space and desk to send: both, or none when the desk is not asked for. */
export const resolveDeskInput = (
    isDeskRequested: boolean,
    desk: DeskChoice
): DeskInput => {
    if (!desk || !isDeskToSend(isDeskRequested, desk)) {
        return { spaceId: null, mapAssetId: null };
    }
    return { spaceId: desk.spaceId, mapAssetId: desk.mapAssetId };
};

/** There is someone to invite, and a desk when one was asked for. */
export const canSendInvitations = ({
    emailCount,
    isDeskRequested,
    desk,
}: SendInvitationsInput): boolean => {
    const hasPeople = emailCount > 0;
    const isDeskMissing = isDeskRequested && desk === null;
    return hasPeople && !isDeskMissing;
};
