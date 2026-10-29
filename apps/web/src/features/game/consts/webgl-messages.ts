// What the person reads when the game cannot draw, or can only draw slowly.
export const WEBGL_MESSAGES = {
    UNSUPPORTED_TITLE: "Seu navegador não consegue exibir o espaço",
    UNSUPPORTED_BODY:
        "O espaço precisa de WebGL, que está desligado ou não existe neste navegador. Ative a aceleração por hardware nas configurações do navegador, atualize o navegador ou tente em outro.",
    SOFTWARE_TITLE: "O espaço pode ficar lento",
    SOFTWARE_BODY:
        "O navegador está desenhando com a CPU, sem aceleração por hardware. Ative a aceleração por hardware nas configurações do navegador para ter um espaço mais fluido.",
    DISMISS: "Entendi",
} as const;
