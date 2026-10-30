// What the login page tells when the sign in with GitHub fails. The API sends
// a fixed code in `?error=`, never the text of GitHub.
export const OAUTH_ERROR_MESSAGES = {
    STATE_INVALID:
        "O pedido de login expirou ou foi aberto em outro navegador. Tente entrar com o GitHub novamente.",
    ACCESS_DENIED: "A autorização no GitHub foi cancelada.",
    EMAIL_UNVERIFIED:
        "Sua conta do GitHub não tem um e-mail principal verificado. Verifique o e-mail no GitHub e tente de novo.",
    EXCHANGE_FAILED:
        "Não foi possível falar com o GitHub agora. Tente novamente em instantes.",
    SIGNUP_CLOSED:
        "O cadastro está fechado nesta instalação. Peça um link de convite a quem administra.",
    FALLBACK: "Não foi possível entrar com o GitHub.",
} as const;

// What the sign up form tells when the API refuses, by the code it sends.
export const SIGN_UP_ERROR_MESSAGES = {
    SIGNUP_CLOSED:
        "O cadastro está fechado. Peça um link de convite a quem administra.",
    USER_ALREADY_EXISTS: "Já existe uma conta com esse e-mail.",
    INVITE_LINK_NOT_FOUND: "Esse link de convite não existe.",
    INVITE_LINK_EXPIRED: "Esse link de convite venceu. Peça um novo.",
    INVITE_LINK_REVOKED: "Esse link de convite foi encerrado. Peça um novo.",
    INVITE_LINK_EXHAUSTED:
        "Esse link de convite já foi usado o máximo de vezes.",
    FALLBACK: "Não foi possível criar sua conta. Tente novamente.",
} as const;
