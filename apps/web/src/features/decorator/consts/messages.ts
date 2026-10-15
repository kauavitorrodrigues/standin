// Toasts and failures of the decorator. pt-BR, because the user reads them.
export const DECORATOR_MESSAGES = {
    APPLY_FAILED: "Não foi possível aplicar a decoração",
    APPLY_RETRY: "Sem conexão. Sua decoração continua salva, tentando de novo",
    OPEN_FAILED: "Não foi possível abrir o decorator",
    LOCK_LOST: "Você perdeu o decorator",
    LOCK_LOST_STUDIO:
        "O dono abriu a edição do espaço. Sua decoração ficou guardada",
    LOCK_RESUMED: "Decorador retomado, sua decoração está intacta",
    LOCK_RECOVERY_FAILED:
        "Não foi possível retomar o decorator. Sua decoração continua salva",
    RESUME_FAILED: "Não foi possível retomar a decoração, ela foi descartada",
    DISCARDED: "Alterações descartadas",
    HOLDER_FALLBACK: "outra pessoa",
    DESK_OWNER_FALLBACK: "outra pessoa",
    STALE_REPLAY_FAILED:
        "O space mudou e a decoração não pôde ser reaplicada, ela foi descartada",
} as const;

// Why the decorator did not open. pt-BR, because the user reads it.
export const DECORATOR_DENIED_MESSAGES = {
    FORBIDDEN: "Só quem faz parte da organização pode decorar este space.",
    decorating: (holder: string): string =>
        `O decorator está em uso por ${holder}. Tente de novo quando terminar.`,
    editing: (holder: string): string =>
        `${holder} está editando a estrutura do space. Tente de novo quando terminar.`,
} as const;

// The notice over the panel while the decorator is read only.
export const DECORATOR_LOCK_NOTICE_MESSAGES = {
    STUDIO: "O dono abriu a edição do space. Sua decoração ficou guardada e você pode retomar quando ele terminar.",
    LOST: "Você perdeu o decorator. Sua decoração está guardada e você pode recuperá-lo.",
    RECOVER: "Recuperar",
} as const;

// Why the Decorar entries are off. pt-BR, because the user reads them.
export const DECORATE_BLOCKED_MESSAGES = {
    decorating: (holder: string): string => `Decorador em uso por ${holder}`,
    editing: (holder: string): string => `${holder} está editando o space`,
} as const;
