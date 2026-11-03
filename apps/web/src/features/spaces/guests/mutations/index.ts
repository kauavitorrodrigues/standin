import { useAnswerGuest } from "./answerGuest";
import { useRemoveGuest } from "./removeGuest";
import { useRequestInvite } from "./requestInvite";
import { useSetGuestAccess } from "./setGuestAccess";

export const GuestMutations = {
    requestInvite: useRequestInvite,
    answer: useAnswerGuest,
    remove: useRemoveGuest,
    setAccess: useSetGuestAccess,
};
