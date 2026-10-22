import { admitGuest } from "./admitGuest";
import { createInviteLink } from "./createInviteLink";
import { denyGuest } from "./denyGuest";
import { getMyGuest } from "./getMyGuest";
import { listGuests } from "./listGuests";
import { listGuestSpaces } from "./listGuestSpaces";
import { listInviteLinks } from "./listInviteLinks";
import { previewInvite } from "./previewInvite";
import { removeGuest } from "./removeGuest";
import { requestInvite } from "./requestInvite";
import { resetGuest } from "./resetGuest";
import { revokeInviteLink } from "./revokeInviteLink";
import { setGuestAccess } from "./setGuestAccess";
import { viewSpace } from "./viewSpace";

export const SpaceGuestController = {
    view: viewSpace,
    inviteLinks: {
        create: createInviteLink,
        list: listInviteLinks,
        revoke: revokeInviteLink,
    },
    invites: {
        preview: previewInvite,
        request: requestInvite,
    },
    list: listGuests,
    me: getMyGuest,
    spaces: listGuestSpaces,
    admit: admitGuest,
    deny: denyGuest,
    reset: resetGuest,
    remove: removeGuest,
    setAccess: setGuestAccess,
};
