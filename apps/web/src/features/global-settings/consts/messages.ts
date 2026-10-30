export const GLOBAL_SETTINGS_PAGE_TEXT = {
    TITLE: "Configurações globais",
    DESCRIPTION:
        "Quem pode usar esta instalação. Vale para todas as organizações e muda na hora, sem reiniciar.",
    SAVE_FAILED: "Não foi possível salvar a configuração.",
    LOAD_FAILED: "Não foi possível carregar os dados.",
} as const;

export const GLOBAL_SETTING_LABELS = {
    allowSignup: {
        title: "Cadastro aberto",
        description:
            "Desligado, ninguém cria conta sozinho. Quem já tem conta continua entrando, e links de convite seguem funcionando.",
    },
    allowOrganizationCreation: {
        title: "Criação de organizações",
        description: "Desligado, só o admin cria organizações.",
    },
    allowSpaceCreation: {
        title: "Criação de espaços",
        description: "Desligado, só o admin cria espaços.",
    },
} as const;
