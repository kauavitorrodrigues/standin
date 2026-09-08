export const LOCAL_AUDIO_STREAM_ERRORS = {
    DENIED: "denied",
    NOT_FOUND: "not-found",
    UNKNOWN: "unknown",
} as const;

export type LocalAudioStreamError =
    (typeof LOCAL_AUDIO_STREAM_ERRORS)[keyof typeof LOCAL_AUDIO_STREAM_ERRORS];

export const LOCAL_AUDIO_STREAM_ERROR_LABEL: Record<
    LocalAudioStreamError,
    string
> = {
    [LOCAL_AUDIO_STREAM_ERRORS.DENIED]: "Permissão de microfone negada",
    [LOCAL_AUDIO_STREAM_ERRORS.NOT_FOUND]: "Nenhum microfone encontrado",
    [LOCAL_AUDIO_STREAM_ERRORS.UNKNOWN]: "Microfone indisponível",
};
