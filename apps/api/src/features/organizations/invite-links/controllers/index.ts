import { acceptInvitation } from "./accept";
import { getFixedLink } from "./getFixed";
import { resetFixedLink } from "./resetFixed";
import { previewInvite } from "./preview";

export const OrganizationInviteController = {
    getFixed: getFixedLink,
    resetFixed: resetFixedLink,
    accept: acceptInvitation,
    preview: previewInvite,
};
