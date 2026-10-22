import { admitSpaceGuest } from "./admit";
import { denySpaceGuest } from "./deny";
import {
    deleteSpaceGuestsBySpaceIds,
    publishGuestsRemoved,
} from "./deleteBySpaceIds";
import { expireDueSpaceGuests } from "./expireDue";
import { findAdmittedSpaceGuest } from "./findAdmitted";
import { findSpaceGuestState } from "./findState";
import { listSpaceGuests } from "./list";
import { listPendingSpaceGuests } from "./listPending";
import { listGuestSpaces } from "./listSpaces";
import { removeSpaceGuest } from "./remove";
import { resetSpaceGuest } from "./reset";
import { setSpaceGuestAccess } from "./setGuestAccess";
import { onSpaceGuestEvent } from "./utils/guestEvents";

export const SpaceGuestService = {
    list: listSpaceGuests,
    listPending: listPendingSpaceGuests,
    listSpacesOf: listGuestSpaces,
    findAdmitted: findAdmittedSpaceGuest,
    findState: findSpaceGuestState,
    admit: admitSpaceGuest,
    deny: denySpaceGuest,
    remove: removeSpaceGuest,
    reset: resetSpaceGuest,
    setAccess: setSpaceGuestAccess,
    expireDue: expireDueSpaceGuests,
    deleteBySpaceIds: deleteSpaceGuestsBySpaceIds,
    publishRemoved: publishGuestsRemoved,
    // Hook for the socket: runs on every step of the approval.
    onEvent: onSpaceGuestEvent,
};

export type { ExpiredGuest } from "./expireDue";
export type { AdmittedGuest, SpaceGuestEvent } from "./types";
