import { LOCAL_AUDIO_STREAM_ERRORS } from "@/features/media-devices/consts/audioError";
import type { LocalAudioStreamError } from "@/features/media-devices/consts/audioError";

export const LOCAL_CAMERA_ERROR_LABEL: Record<LocalAudioStreamError, string> = {
    [LOCAL_AUDIO_STREAM_ERRORS.DENIED]: "Permissão de câmera negada",
    [LOCAL_AUDIO_STREAM_ERRORS.NOT_FOUND]: "Nenhuma câmera encontrada",
    [LOCAL_AUDIO_STREAM_ERRORS.UNKNOWN]: "Câmera indisponível",
};

export const SCREEN_SHARE_ERRORS = {
    UNSUPPORTED: "unsupported",
    UNKNOWN: "unknown",
} as const;

export type ScreenShareError =
    (typeof SCREEN_SHARE_ERRORS)[keyof typeof SCREEN_SHARE_ERRORS];

export const SCREEN_SHARE_ERROR_LABEL: Record<ScreenShareError, string> = {
    [SCREEN_SHARE_ERRORS.UNSUPPORTED]:
        "Seu navegador não suporta compartilhar a tela",
    [SCREEN_SHARE_ERRORS.UNKNOWN]: "Não foi possível compartilhar a tela",
};
