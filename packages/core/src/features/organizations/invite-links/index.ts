import { getFixedOrganizationLink, resetFixedOrganizationLink } from "./fixed";
import { previewOrganizationInvite } from "./preview";
import { signUpWithOrganizationInvite } from "./signUp";

export const OrganizationInviteService = {
    getFixed: getFixedOrganizationLink,
    resetFixed: resetFixedOrganizationLink,
    preview: previewOrganizationInvite,
    signUp: signUpWithOrganizationInvite,
};
