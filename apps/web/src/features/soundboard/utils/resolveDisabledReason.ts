import { LOCAL_AUDIO_STREAM_ERROR_LABEL } from "@/features/media-devices/consts/audioError";
import { SOUNDBOARD_MESSAGES } from "../consts/messages";
import type { DisabledReasonInput } from "../types/space";

/**
 * Why a clip cannot go out right now, null when it can. The limit of clips at
 * once is not a reason: it only disables the buttons, and says nothing.
 */
export const resolveDisabledReason = ({
    micError,
    hasMicStream,
    isHeadphonesOn,
}: DisabledReasonInput): string | null => {
    if (micError) return LOCAL_AUDIO_STREAM_ERROR_LABEL[micError];
    if (isHeadphonesOn) return SOUNDBOARD_MESSAGES.HEADPHONES;
    if (!hasMicStream) return SOUNDBOARD_MESSAGES.MIC_UNAVAILABLE;
    return null;
};
