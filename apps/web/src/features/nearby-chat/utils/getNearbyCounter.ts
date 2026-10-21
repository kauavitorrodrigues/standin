import {
    NEARBY_MESSAGE_COUNTER_AT,
    NEARBY_MESSAGE_MAX_LENGTH,
    NEARBY_MESSAGE_WARN_AT,
} from "@standin/contracts";
import { isOnlyUrl } from "@/features/game/utils/isOnlyUrl";
import type { NearbyCounter } from "@/features/nearby-chat/types/nearby-chat";

// What the header shows about the length of the text. A link is exempt from the
// limit, so it never warns and never blocks.
export const getNearbyCounter = (text: string): NearbyCounter => {
    const length = text.length;
    const isLink = isOnlyUrl(text);

    return {
        length,
        isVisible: length >= NEARBY_MESSAGE_COUNTER_AT && !isLink,
        isWarning: length >= NEARBY_MESSAGE_WARN_AT && !isLink,
        isOverLimit: length > NEARBY_MESSAGE_MAX_LENGTH && !isLink,
    };
};
