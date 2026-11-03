import {
    acceptOrganizationInvitation,
    previewOrganizationInvitation,
    signUpWithOrganizationInvitation,
} from "./accept";
import { cancelOrganizationInvitation } from "./cancel";
import { createOrganizationInvitations } from "./create";
import { listOrganizationInvitationDesks } from "./freeDesks";
import { listOrganizationInvitations } from "./list";

export const OrganizationInvitationService = {
    create: createOrganizationInvitations,
    list: listOrganizationInvitations,
    cancel: cancelOrganizationInvitation,
    freeDesks: listOrganizationInvitationDesks,
    preview: previewOrganizationInvitation,
    accept: acceptOrganizationInvitation,
    signUp: signUpWithOrganizationInvitation,
};
