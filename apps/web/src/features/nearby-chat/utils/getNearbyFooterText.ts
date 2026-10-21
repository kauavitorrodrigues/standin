import { NEARBY_CHAT_TEXTS } from "@/features/nearby-chat/consts/nearby-chat";

export const getNearbyFooterText = (hasText: boolean): string => {
    if (hasText) return NEARBY_CHAT_TEXTS.FOOTER_TYPING;
    return NEARBY_CHAT_TEXTS.FOOTER_EMPTY;
};
