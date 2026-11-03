import {
    ACCEPT_FALLBACK_MESSAGE,
    EMAIL_MISMATCH_CODE,
    INVITE_ERROR_MESSAGES,
} from "../consts/messages";
import type { InviteErrorInput, JoinView, JoinViewInput } from "../types";

// A link keeps its old flow; an invitation by e-mail depends on the session.
export const getJoinView = ({
    isLoading,
    invite,
    user,
}: JoinViewInput): JoinView => {
    if (isLoading) return "loading";
    if (!invite) return "error";
    if (!invite.email) return "link";
    return user ? "accept" : "invitedSignUp";
};

const isKnownCode = (
    code: string
): code is keyof typeof INVITE_ERROR_MESSAGES =>
    code in INVITE_ERROR_MESSAGES && code !== "FALLBACK";

export const getInviteErrorMessage = ({
    code,
    invitedEmail,
}: InviteErrorInput): string => {
    if (code === EMAIL_MISMATCH_CODE) {
        const target = invitedEmail
            ? `o e-mail ${invitedEmail}`
            : "outro e-mail";
        return `Esse convite é para ${target}. Entre com a conta desse e-mail para aceitar.`;
    }
    if (code && isKnownCode(code)) return INVITE_ERROR_MESSAGES[code];
    return INVITE_ERROR_MESSAGES.FALLBACK;
};

// Failing to accept is not the same as failing to open: the fallback differs.
export const getAcceptErrorMessage = (input: InviteErrorInput): string => {
    const message = getInviteErrorMessage(input);
    if (message === INVITE_ERROR_MESSAGES.FALLBACK)
        return ACCEPT_FALLBACK_MESSAGE;
    return message;
};
