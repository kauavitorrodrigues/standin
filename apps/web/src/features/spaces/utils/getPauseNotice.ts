import { MEDIA_PAUSE_REASONS, type MediaPauseReason } from "@standin/contracts";

export type PauseNotice = {
    // What fits in a small tile.
    short: string;
    // The whole sentence, for the tooltip and the screen readers.
    full: string;
};

const NOTICES: Record<MediaPauseReason, PauseNotice> = {
    [MEDIA_PAUSE_REASONS.CLIENT_LIMIT]: {
        short: "Pausado para economizar a sua máquina",
        full: "Vídeo pausado para economizar a sua máquina",
    },
    [MEDIA_PAUSE_REASONS.SERVER_LIMIT]: {
        short: "Pausado para aliviar o servidor",
        full: "Vídeo pausado porque o servidor está sobrecarregado",
    },
    [MEDIA_PAUSE_REASONS.USER_HIDDEN]: {
        short: "Vídeo oculto",
        full: "Você ocultou o vídeo desta pessoa",
    },
    [MEDIA_PAUSE_REASONS.SPACE_RULE]: {
        short: "Vídeo indisponível aqui",
        full: "O vídeo desta pessoa não está disponível nesta área",
    },
};

// The notice a tile shows in place of a picture that is not playing.
export const getPauseNotice = (reason: MediaPauseReason): PauseNotice =>
    NOTICES[reason];
