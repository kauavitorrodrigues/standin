import { createInviteLink } from "./create";
import { listInviteLinks } from "./list";
import { previewInvite } from "./preview";
import { revokeInviteLink } from "./revoke";

export const OrganizationInviteController = {
    create: createInviteLink,
    list: listInviteLinks,
    revoke: revokeInviteLink,
    preview: previewInvite,
};
