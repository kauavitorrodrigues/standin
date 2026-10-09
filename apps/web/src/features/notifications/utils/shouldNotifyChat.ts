import { CONVERSATION_TYPES, type ConversationType } from "@standin/contracts";
import type {
    ChatNotifyMode,
    ChatSoundMode,
} from "@/features/notifications/consts/notificationSettings";

const isDirect = (type: ConversationType): boolean =>
    type === CONVERSATION_TYPES.DIRECT;

export const shouldNotifyChat = (
    mode: ChatNotifyMode,
    type: ConversationType
): boolean => mode === "all" || (mode === "direct" && isDirect(type));

export const shouldPlayChatSound = (
    mode: ChatSoundMode,
    type: ConversationType
): boolean => mode === "all" || (mode === "direct" && isDirect(type));
