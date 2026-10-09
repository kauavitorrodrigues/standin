import {
    LOCAL_AUDIO_STREAM_ERROR_LABEL,
    type LocalAudioStreamError,
} from "@/features/media-devices/consts/audioError";

export type MicPreviewCaption = { text: string; isError: boolean };

export const getMicPreviewCaption = (
    error: LocalAudioStreamError | null,
    hasStream: boolean,
    isListening: boolean
): MicPreviewCaption => {
    if (error)
        return { text: LOCAL_AUDIO_STREAM_ERROR_LABEL[error], isError: true };
    if (!hasStream) return { text: "Abrindo o microfone", isError: false };
    if (isListening) return { text: "Ouvindo a sua voz", isError: false };
    return { text: "Fale algo para ver o nível", isError: false };
};
