import { PROFILE_PICTURE } from "@standin/contracts";

const BYTES_PER_MB = 1024 * 1024;

// What the person is told when something goes wrong with the profile picture.
// A success is not announced: the window closes and the new photo shows.
export const PROFILE_PICTURE_MESSAGES = {
    FORMAT_NOT_ACCEPTED: "Use uma foto PNG, JPEG ou WebP.",
    FILE_TOO_LARGE: `A foto precisa ter no máximo ${PROFILE_PICTURE.maxBytes / BYTES_PER_MB} MB.`,
    IMAGE_TOO_SMALL: `A foto precisa ter pelo menos ${PROFILE_PICTURE.minSide} px de lado.`,
    IMAGE_UNREADABLE: "Não foi possível ler essa imagem.",
    SAVE_FAILED: "Não foi possível salvar a foto de perfil.",
    REMOVE_FAILED: "Não foi possível remover a foto de perfil.",
} as const;

// The words of the status of the person: the choices, the labels under the
// name and the custom status line.
export const USER_STATUS_MESSAGES = {
    SYNC_FAILED: "Não foi possível atualizar o seu status.",
    LABELS: {
        active: "Ativo",
        away: "Ausente",
        busy: "Ocupado",
    },
    // The remaining time, as "Manter o prazo atual (até 18:30)".
    KEEP_DEADLINE: (time: string) => `Manter o prazo atual (até ${time})`,
    CUSTOM: {
        TEXT_PLACEHOLDER: "Atualizar seu status",
        TEXT_LABEL: "Texto do status",
        EMOJI_LABEL: "Emoji do status",
        DURATION_LABEL: "Limpar status depois de",
        SAVE: "Salvar status",
        CLEAR: "Limpar status",
    },
    DURATIONS: {
        keep: "Manter o prazo atual",
        never: "Não limpar",
        "30m": "30 minutos",
        "1h": "1 hora",
        "4h": "4 horas",
        today: "Até o fim do dia",
    },
} as const;

// What each refusal of the server means for the person, by its error code.
export const PROFILE_PICTURE_ERROR_MESSAGES = {
    PROFILE_PICTURE_INVALID:
        "Essa imagem não é válida. Use uma foto PNG, JPEG ou WebP, sem animação.",
    PROFILE_PICTURE_TOO_LARGE: PROFILE_PICTURE_MESSAGES.FILE_TOO_LARGE,
    PROFILE_PICTURE_UNSUPPORTED_MEDIA: "Envie a foto como um arquivo.",
} as const;
