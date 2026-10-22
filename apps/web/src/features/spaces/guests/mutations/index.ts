import { useAnswerGuest } from "./answerGuest";
import { useCreateInviteLink, useRevokeInviteLink } from "./inviteLinks";
import { useRemoveGuest } from "./removeGuest";
import { useRequestInvite } from "./requestInvite";
import { useSetGuestAccess } from "./setGuestAccess";

export const GuestMutations = {
    requestInvite: useRequestInvite,
    answer: useAnswerGuest,
    remove: useRemoveGuest,
    createLink: useCreateInviteLink,
    revokeLink: useRevokeInviteLink,
    setAccess: useSetGuestAccess,
};
