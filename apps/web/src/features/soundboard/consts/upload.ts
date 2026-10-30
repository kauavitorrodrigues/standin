import type { UploadPhaseLabels } from "../types/upload";

export const UPLOAD_SUBMIT_LABELS: UploadPhaseLabels = {
    idle: "Adicionar",
    encoding: "Preparando...",
    sending: "Enviando...",
};

// What the file picker offers, besides the extensions of the accepted formats.
export const SOUNDBOARD_ACCEPT_MIME = "audio/mpeg";
