import { admitGuest } from "./admitGuest";
import { archiveGuest } from "./archiveGuest";
import { getFixedLink } from "./getFixedLink";
import { listGuestEntries } from "./listGuestEntries";
import { resetFixedLink } from "./resetFixedLink";
import { setGuestValidity } from "./setGuestValidity";
import { denyGuest } from "./denyGuest";
import { getMyGuest } from "./getMyGuest";
import { listGuests } from "./listGuests";
import { listGuestSpaces } from "./listGuestSpaces";
import { previewInvite } from "./previewInvite";
import { removeGuest } from "./removeGuest";
import { requestInvite } from "./requestInvite";
import { resetGuest } from "./resetGuest";
import { setGuestAccess } from "./setGuestAccess";
import { viewSpace } from "./viewSpace";

export const SpaceGuestController = {
    view: viewSpace,
    inviteLinks: {
        getFixed: getFixedLink,
        resetFixed: resetFixedLink,
        setValidity: setGuestValidity,
    },
    invites: {
        preview: previewInvite,
        request: requestInvite,
    },
    list: listGuests,
    listEntries: listGuestEntries,
    archive: archiveGuest,
    me: getMyGuest,
    spaces: listGuestSpaces,
    admit: admitGuest,
    deny: denyGuest,
    reset: resetGuest,
    remove: removeGuest,
    setAccess: setGuestAccess,
};
