import { getApiError } from "@/features/assets/utils/getApiError";
import { AVATAR_PART_ERROR_MESSAGES } from "../../consts/messages";

type KnownCode = keyof typeof AVATAR_PART_ERROR_MESSAGES;

const isKnownCode = (code: string): code is KnownCode =>
    code in AVATAR_PART_ERROR_MESSAGES;

// What goes above a form when the API refuses it: the words of the page for
// the error code, or the fallback.
export const getAvatarPartErrorMessage = (
    error: unknown,
    fallback: string
): string => {
    const { code } = getApiError(error);
    if (code === null || !isKnownCode(code)) return fallback;
    return AVATAR_PART_ERROR_MESSAGES[code];
};
