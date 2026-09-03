import { useSendMessage } from "./send";
import { useToggleReaction } from "./toggleReaction";
import { useUpdateMessage } from "./update";
import { useDeleteMessage } from "./delete";

export const ChatMutations = {
    send: useSendMessage,
    toggleReaction: useToggleReaction,
    update: useUpdateMessage,
    delete: useDeleteMessage,
};
