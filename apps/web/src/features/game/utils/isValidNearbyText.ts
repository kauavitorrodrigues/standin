import {
    NEARBY_MESSAGE_MAX_LENGTH,
    NEARBY_MESSAGE_RECEIVE_MAX_LENGTH,
} from "@standin/contracts";
import { isOnlyUrl } from "@/features/game/utils/isOnlyUrl";
import { sanitizeNearbyText } from "@/features/game/utils/sanitizeNearbyText";

// Whether the text may be sent or shown: 1 to 50 characters, or a link of up to
// 500. The length is read after the sanitizing, which is what is displayed.
export const isValidNearbyText = (text: unknown): text is string => {
    if (typeof text !== "string") return false;
    if (text.length > NEARBY_MESSAGE_RECEIVE_MAX_LENGTH) return false;

    const clean = sanitizeNearbyText(text);
    if (clean === "") return false;
    if (clean.length <= NEARBY_MESSAGE_MAX_LENGTH) return true;

    return isOnlyUrl(clean);
};
