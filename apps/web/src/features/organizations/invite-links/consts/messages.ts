import { SIGN_UP_ERROR_MESSAGES } from "@/features/auth/consts/messages";

// What the join page tells when the API refuses, by the code it sends.
export const INVITE_ERROR_MESSAGES = {
    ORGANIZATION_INVITATION_NOT_FOUND:
        "Esse convite não existe ou já foi usado.",
    ORGANIZATION_INVITATION_EXPIRED:
        "Esse convite venceu. Peça um novo a quem convidou você.",
    INVITE_LINK_NOT_FOUND: SIGN_UP_ERROR_MESSAGES.INVITE_LINK_NOT_FOUND,
    INVITE_LINK_EXPIRED: SIGN_UP_ERROR_MESSAGES.INVITE_LINK_EXPIRED,
    INVITE_LINK_REVOKED: SIGN_UP_ERROR_MESSAGES.INVITE_LINK_REVOKED,
    INVITE_LINK_EXHAUSTED: SIGN_UP_ERROR_MESSAGES.INVITE_LINK_EXHAUSTED,
    FALLBACK: "Não foi possível abrir o convite. Tente novamente.",
} as const;

export const ACCEPT_FALLBACK_MESSAGE =
    "Não foi possível aceitar o convite. Tente novamente.";

export const EMAIL_MISMATCH_CODE = "ORGANIZATION_INVITATION_EMAIL_MISMATCH";

export const JOIN_TEXTS = {
    unavailableTitle: "Convite indisponível",
    signUpDescription: "Crie sua conta para entrar na organização.",
    invitedSignUpDescription:
        "Crie sua conta com o e-mail do convite para entrar na organização.",
    acceptDescription: "Aceite o convite para entrar na organização.",
    accept: "Aceitar convite",
    haveAccount: "Já tenho uma conta",
    useOtherAccount: "Entrar com outra conta",
} as const;
