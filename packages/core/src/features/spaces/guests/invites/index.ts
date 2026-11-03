import {
    getFixedInviteLink,
    resetFixedInviteLink,
    setGuestValidity,
} from "./fixed";
import { previewInvite } from "./preview";
import { requestInvite } from "./request";

export const SpaceInviteService = {
    getFixed: getFixedInviteLink,
    resetFixed: resetFixedInviteLink,
    setValidity: setGuestValidity,
    preview: previewInvite,
    request: requestInvite,
};
