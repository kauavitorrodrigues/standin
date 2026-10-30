import { createOrganizationInviteLink } from "./create";
import { listOrganizationInviteLinks } from "./list";
import { previewOrganizationInvite } from "./preview";
import { revokeOrganizationInviteLink } from "./revoke";
import { signUpWithOrganizationInvite } from "./signUp";

export const OrganizationInviteService = {
    create: createOrganizationInviteLink,
    list: listOrganizationInviteLinks,
    revoke: revokeOrganizationInviteLink,
    preview: previewOrganizationInvite,
    signUp: signUpWithOrganizationInvite,
};
