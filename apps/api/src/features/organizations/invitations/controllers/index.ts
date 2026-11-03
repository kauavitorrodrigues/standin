import { cancelInvitation } from "./cancel";
import { createInvitations } from "./create";
import { listFreeDesks } from "./freeDesks";
import { listInvitations } from "./list";

export const OrganizationInvitationController = {
    create: createInvitations,
    list: listInvitations,
    cancel: cancelInvitation,
    freeDesks: listFreeDesks,
};
