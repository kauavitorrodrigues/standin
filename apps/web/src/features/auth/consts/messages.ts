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
    FALLBACK: "Não foi possível entrar com o GitHub.",
} as const;
