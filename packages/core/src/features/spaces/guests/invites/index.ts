import { createInviteLink } from "./create";
import { listInviteLinks } from "./list";
import { previewInvite } from "./preview";
import { requestInvite } from "./request";
import { revokeInviteLink } from "./revoke";

export const SpaceInviteService = {
    create: createInviteLink,
    list: listInviteLinks,
    revoke: revokeInviteLink,
    preview: previewInvite,
    request: requestInvite,
};
